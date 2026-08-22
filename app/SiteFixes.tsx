"use client";

import { useEffect } from "react";

const JAMI_SRC = "/jami-final.jpg?v=3";

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

export default function SiteFixes() {
  useEffect(() => {
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
  }, []);

  return null;
}
