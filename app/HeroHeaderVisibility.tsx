"use client";

import { useEffect } from "react";

export default function HeroHeaderVisibility() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.getElementById("top");

    if (!header || !hero) return;

    let frame = 0;

    const updateHeader = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const cutoff = header.offsetHeight + 18;
        const heroBottom = hero.getBoundingClientRect().bottom;
        header.classList.toggle("header-outside-hero", heroBottom <= cutoff);
      });
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
      header.classList.remove("header-outside-hero");
    };
  }, []);

  return null;
}
