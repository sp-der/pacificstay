"use client";

import { useEffect } from "react";

const JAMI_SRC = "/jami-final.jpg?v=3";
const PUBLIC_EMAIL = "info@pacificstayproperties.com";
const CHESTNUT_MAP_EMBED =
  "https://www.google.com/maps?q=Carlsbad%20Village%2C%20Carlsbad%2C%20CA&z=15&output=embed";
const CHESTNUT_MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=Carlsbad+Village,+Carlsbad,+CA";

function ensureJamiPhoto(container: Element | null, alt: string) {
  if (!container || container.querySelector("img.jami-live-photo")) return;

  const img = document.createElement("img");
  img.src = JAMI_SRC;
  img.alt = alt;
  img.className = "jami-live-photo";
  img.loading = "eager";
  img.decoding = "async";
  container.appendChild(img);
}

function replaceText(node: Node) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes("Jami.jimenez718@gmail.com")) {
    node.textContent = node.textContent.replaceAll("Jami.jimenez718@gmail.com", PUBLIC_EMAIL);
    return;
  }
  node.childNodes.forEach(replaceText);
}

function updatePublicEmail() {
  document.querySelectorAll<HTMLAnchorElement>('a[href="mailto:Jami.jimenez718@gmail.com"]').forEach((link) => {
    link.href = `mailto:${PUBLIC_EMAIL}`;
    replaceText(link);
  });
}

function ensurePropertyMap(propertyPage: Element | null) {
  if (!propertyPage || propertyPage.querySelector(".property-google-map")) return;

  const locationCard = propertyPage.querySelector(".property-location-card");
  const locationSection = locationCard?.closest(".property-copy-section");
  if (!locationCard || !locationSection) return;

  const mapBlock = document.createElement("div");
  mapBlock.className = "property-google-map";

  const mapFrame = document.createElement("div");
  mapFrame.className = "property-google-map-frame";

  const iframe = document.createElement("iframe");
  iframe.src = CHESTNUT_MAP_EMBED;
  iframe.title = "Carlsbad Village area map";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.allowFullscreen = true;
  mapFrame.appendChild(iframe);

  const mapFooter = document.createElement("div");
  mapFooter.className = "property-google-map-footer";

  const mapCopy = document.createElement("div");
  const mapEyebrow = document.createElement("span");
  mapEyebrow.className = "property-google-map-eyebrow";
  mapEyebrow.textContent = "Explore the area";
  const mapTitle = document.createElement("strong");
  mapTitle.textContent = "Carlsbad Village & Coast";
  mapCopy.append(mapEyebrow, mapTitle);

  const mapLink = document.createElement("a");
  mapLink.href = CHESTNUT_MAP_LINK;
  mapLink.target = "_blank";
  mapLink.rel = "noreferrer";
  mapLink.textContent = "Open in Google Maps ↗";

  mapFooter.append(mapCopy, mapLink);

  const nearby = document.createElement("div");
  nearby.className = "property-nearby-strip";
  ["Beach access", "Carlsbad Village", "Restaurants & cafés", "Shopping & galleries"].forEach((label) => {
    const item = document.createElement("span");
    item.textContent = label;
    nearby.appendChild(item);
  });

  mapBlock.append(mapFrame, mapFooter, nearby);
  locationSection.appendChild(mapBlock);
}

export default function SiteFixes() {
  useEffect(() => {
    updatePublicEmail();
    ensureJamiPhoto(document.querySelector(".jami-portrait-placeholder"), "Jami Jimenez");
    ensureJamiPhoto(document.querySelector(".contact-photo-slot"), "Jami Jimenez");
    ensureJamiPhoto(document.querySelector(".property-host-photo"), "Jami Jimenez");

    const propertyPage = document.querySelector(".property-page");
    const gallery = propertyPage?.querySelector(".property-gallery");
    const bookingColumn = propertyPage?.querySelector(".property-booking-column");
    const propertyBody = propertyPage?.querySelector(".property-body");

    if (propertyPage && gallery && bookingColumn && propertyBody && !propertyPage.querySelector(".property-inline-booking")) {
      const bookingSection = document.createElement("section");
      bookingSection.className = "property-inline-booking property-shell";
      bookingSection.setAttribute("aria-label", "Book your stay");

      gallery.insertAdjacentElement("afterend", bookingSection);
      bookingSection.appendChild(bookingColumn);
      bookingColumn.classList.add("property-booking-column-inline");
      propertyBody.classList.add("booking-moved");
    }

    ensurePropertyMap(propertyPage);
  }, []);

  return null;
}
