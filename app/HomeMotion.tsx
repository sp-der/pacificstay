"use client";

import { useEffect } from "react";

const revealGroups = [
  ".intro-copy-section .eyebrow, .intro-copy-section .display-heading, .intro-copy-section .lead-copy",
  ".section-heading-row > *",
  ".stay-card",
  ".path-card .path-content > *",
  ".management-top > *",
  ".service-card",
  ".management-feature-image, .management-feature-copy > *",
  ".quote-break-content > *",
  ".jami-story-grid > *",
  ".reviews-heading > *",
  ".review-card",
  ".personal-contact-grid > *",
  ".site-footer .footer-grid > *, .site-footer .footer-bottom > *",
];

export default function HomeMotion() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.getElementById("top");
    const root = hero?.closest("main");

    if (!header || !hero || !root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    const targets = new Set<HTMLElement>();
    let frame = 0;
    let startFrame = 0;
    let startFrameTwo = 0;

    const updateHeader = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const cutoff = header.offsetHeight + 18;
        const heroBottom = hero.getBoundingClientRect().bottom;
        header.classList.toggle("header-outside-hero", heroBottom <= cutoff);
      });
    };

    revealGroups.forEach((selector) => {
      const group = Array.from(root.querySelectorAll<HTMLElement>(selector));

      group.forEach((element, index) => {
        element.classList.add("motion-reveal");
        element.style.setProperty("--motion-delay", `${Math.min(index, 4) * 55}ms`);

        if (element.matches(".display-heading, h2, h3")) {
          element.classList.add("motion-heading");
        }

        if (element.matches(".stay-card, .service-card, .review-card")) {
          element.classList.add("motion-card");
        }

        if (element.matches(".management-feature-image, .jami-portrait-frame")) {
          element.classList.add("motion-image");
        }

        targets.add(element);
      });
    });

    html.classList.add("motion-ready");
    html.classList.toggle("motion-reduced", reduceMotion.matches);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.classList.add("motion-in");
          observer.unobserve(element);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px",
      },
    );

    startFrame = window.requestAnimationFrame(() => {
      startFrameTwo = window.requestAnimationFrame(() => {
        targets.forEach((element) => observer.observe(element));
      });
    });

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(startFrame);
      window.cancelAnimationFrame(startFrameTwo);
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
      header.classList.remove("header-outside-hero");
      html.classList.remove("motion-ready", "motion-reduced");

      targets.forEach((element) => {
        element.classList.remove("motion-reveal", "motion-heading", "motion-card", "motion-image", "motion-in");
        element.style.removeProperty("--motion-delay");
      });
    };
  }, []);

  return null;
}
