"use client";

import { useEffect } from "react";

const revealGroups = [
  ".property-title-section .property-back-link, .property-title-grid > *",
  ".property-gallery-main, .property-gallery-side > *",
  ".property-booking-column > *",
  ".property-quick-facts > *",
  ".property-copy-section > .property-eyebrow, .property-copy-section > h2, .property-copy-section > .property-summary, .property-copy-section > p",
  ".property-highlight-grid > *",
  ".property-rating-header",
  ".property-review-score-grid > *",
  ".sleeping-grid > *",
  ".amenity-group-grid > *",
  ".arrival-grid > *",
  ".property-two-column-details > *",
  ".property-location-card, .property-google-map",
  ".property-host-section > *",
  ".property-footer .property-shell > *",
];

export default function PropertyMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".property-page");
    if (!root) return;

    const html = document.documentElement;
    const targets = new Set<HTMLElement>();
    let frame = 0;
    let primingFrame = 0;
    let primingFrameTwo = 0;

    revealGroups.forEach((selector) => {
      const group = Array.from(root.querySelectorAll<HTMLElement>(selector));

      group.forEach((element, index) => {
        element.classList.add("property-motion-reveal");
        element.style.setProperty("--property-motion-delay", `${Math.min(index, 4) * 45}ms`);

        if (element.matches("h1, h2, h3")) {
          element.classList.add("property-motion-heading");
        }

        targets.add(element);
      });
    });

    html.classList.add("property-motion-ready");

    const updateMotion = () => {
      const revealLine = window.innerHeight * 0.88;

      targets.forEach((element) => {
        if (element.classList.contains("property-motion-in")) return;

        const rect = element.getBoundingClientRect();
        if (rect.top <= revealLine && rect.bottom >= 0) {
          element.classList.add("property-motion-in");
        }
      });
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateMotion);
    };

    primingFrame = window.requestAnimationFrame(() => {
      primingFrameTwo = window.requestAnimationFrame(updateMotion);
    });

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(primingFrame);
      window.cancelAnimationFrame(primingFrameTwo);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      html.classList.remove("property-motion-ready");

      targets.forEach((element) => {
        element.classList.remove("property-motion-reveal", "property-motion-heading", "property-motion-in");
        element.style.removeProperty("--property-motion-delay");
      });
    };
  }, []);

  return null;
}
