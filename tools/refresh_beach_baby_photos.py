#!/usr/bin/env python3
"""Refresh Beach Baby images from the current public Airbnb photo tour.

Runs only on a temporary refresh branch. Fails closed if the gallery can't
be confidently loaded, so older site assets are never partially overwritten.
"""
import hashlib
import io
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit

import requests
from PIL import Image, ImageOps
from playwright.sync_api import sync_playwright

LISTING_ID = "1763283615794372898"
URL = f"https://www.airbnb.com/rooms/{LISTING_ID}"
PHOTO_DIR = Path("public/beach-baby")
MANIFEST = Path("docs/imports/beach-baby-photos.json")
PATTERN = re.compile(
    rf"https?://a\d+\.muscache\.com/(?:im/)?pictures/hosting/"
    rf"Hosting-{LISTING_ID}/original/[\w-]+\.(?:jpe?g|png|webp)",
    re.IGNORECASE,
)
COVER_ID = "635287c9-83a5-4ad1-b237-376c6ce25c54"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
    "Referer": URL,
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}

def sources(text):
    return [x.replace("\\u002F", "/").replace("\\/", "/").replace("&amp;", "&")
            for x in PATTERN.findall(text)]

def photo_id(url):
    return urlsplit(url).path.rsplit("/", 1)[-1].split(".")[0]

def add_unique(target, seen, candidates):
    for candidate in candidates:
        pid = photo_id(candidate)
        if pid not in seen:
            target.append(candidate)
            seen.add(pid)

def browser_gallery():
    ordered, seen, observed = [], set(), []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        page = browser.new_page(
            viewport={"width": 1500, "height": 1080},
            user_agent=HEADERS["User-Agent"], locale="en-US",
        )
        def capture_response(response):
            observed.extend(sources(response.url))
            if "airbnb.com" in response.url and "json" in response.headers.get("content-type", ""):
                try:
                    if int(response.headers.get("content-length", "0") or 0) < 2000000:
                        observed.extend(sources(response.text()))
                except Exception:
                    pass
        page.on("response", capture_response)
        print(f"Opening {URL}", flush=True)
        page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(6000)

        def snapshot(label):
            try:
                imgs = page.locator("img").evaluate_all("""els => els.flatMap(el => [
                  el.currentSrc, el.src, el.getAttribute("data-original-uri"),
                  el.getAttribute("srcset"), el.getAttribute("data-src")
                ].filter(Boolean))""")
                for src in imgs:
                    add_unique(ordered, seen, sources(src))
                add_unique(ordered, seen, sources(page.content()))
                print(f"{label}: {len(ordered)} DOM images, {len(observed)} network URLs; url={page.url}", flush=True)
            except Exception as error:
                print(f"Snapshot issue: {error}", flush=True)

        snapshot("Initial listing")
        try:
            page.get_by_text("Show all photos", exact=False).first.click(timeout=15000)
            page.wait_for_timeout(3500)
            snapshot("Photo tour opened")
        except Exception as error:
            print(f"Show-all click failed: {error}", flush=True)
            try:
                page.goto(f"{URL}/photos", wait_until="domcontentloaded", timeout=45000)
                page.wait_for_timeout(3500)
                snapshot("Direct photo-tour URL")
            except Exception as error2:
                print(f"Direct gallery failed: {error2}", flush=True)

        last_count, stagnant = -1, 0
        for index in range(65):
            page.mouse.wheel(0, 1100)
            page.evaluate("""() => {
              for (const el of document.querySelectorAll('*')) {
                if (el.scrollHeight > el.clientHeight + 800 &&
                    el.clientHeight > 250 && getComputedStyle(el).overflowY !== 'hidden')
                  el.scrollTop += 1100;
              }
            }""")
            page.wait_for_timeout(350)
            if index % 3 == 0:
                snapshot(f"Scroll {index+1}")
                count = len(ordered) + len({photo_id(u) for u in observed})
                if count == last_count:
                    stagnant += 1
                else:
                    stagnant = 0
                last_count = count
                if stagnant >= 7 and len(ordered) >= 20:
                    break

        snapshot("Final")
        browser.close()
    # DOM order generally follows the guest photo tour; network is a fallback.
    add_unique(ordered, seen, observed)
    if COVER_ID in {photo_id(u) for u in ordered}:
        cover = next(u for u in ordered if photo_id(u) == COVER_ID)
        ordered = [cover] + [u for u in ordered if photo_id(u) != COVER_ID]
    return ordered

def fetch_image(session, url):
    # Prefer the original image, fall back to Airbnb's large format transform.
    base = url.replace("/im/pictures/", "/pictures/")
    candidates = [base, url + "?im_w=1920", url + "?im_w=1440"]
    errors = []
    for candidate in candidates:
        try:
            response = session.get(candidate, timeout=30)
            response.raise_for_status()
            original = Image.open(io.BytesIO(response.content))
            original.load()
            img = ImageOps.exif_transpose(original).convert("RGB")
            if img.width < 1100 or img.height < 600:
                raise ValueError(f"Unexpectedly small image {img.size}")
            return img, response.content, candidate
        except Exception as error:
            errors.append(f"{candidate}: {str(error)[:100]}")
    raise RuntimeError(" | ".join(errors))

def main():
    urls = browser_gallery()
    print("Gallery image IDs (in discovered order):")
    for i, url in enumerate(urls):
        print(f"  {i+1:02}: {photo_id(url)}")
    if len(urls) < 20:
        raise RuntimeError(f"Only found {len(urls)} unique gallery photos; need at least 20. Refusing partial refresh.")
    if photo_id(urls[0]) != COVER_ID:
        raise RuntimeError("Current verified cover image missing; refusing uncertain gallery.")

    session = requests.Session()
    session.headers.update(HEADERS)
    rendered, metadata = [], []
    # Download everything before writing to ensure a partial download can't corrupt assets.
    for i, url in enumerate(urls, 1):
        img, raw, source = fetch_image(session, url)
        output = io.BytesIO()
        img.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
        img.save(output, "WEBP", quality=84, method=6)
        rendered.append(output.getvalue())
        metadata.append({
            "file": f"beach-baby-{i:02}.webp",
            "originalWidth": img.width,
            "originalHeight": img.height,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "source": source,
        })
        print(f"Downloaded {i}/{len(urls)}: {img.width}x{img.height}", flush=True)

    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    for i, data in enumerate(rendered, 1):
        (PHOTO_DIR / f"beach-baby-{i:02}.webp").write_bytes(data)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"SUCCESS: {len(rendered)} fresh photos staged.", flush=True)
    if len(rendered) != 20:
        print("NOTICE: Live database photo-tour references only 20 existing slots; additional images require an owner data update.", flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"SAFE STOP: {exc}", file=sys.stderr, flush=True)
        raise
