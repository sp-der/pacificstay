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

const easeInOutCubic = (progress: number) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

export default function HomeMotion() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.getElementById("top");
    const story = document.getElementById("story");
    const meetJamiButton = document.querySelector<HTMLButtonElement>(".hero-bottom button");
    const root = document.querySelector<HTMLElement>("main");

    if (!header || !hero || !root) return;

    const html = document.documentElement;
    const targets = new Set<HTMLElement>();
    let frame = 0;
    let primingFrame = 0;
    let primingFrameTwo = 0;
    let meetJamiScrollFrame = 0;

    revealGroups.forEach((selector) => {
      const group = Array.from(root.querySelectorAll<HTMLElement>(selector));

      group.forEach((element, index) => {
        element.classList.add("motion-reveal");
        element.style.setProperty("--motion-delay", `${Math.min(index, 4) * 45}ms`);

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

    const updatePageMotion = () => {
      const cutoff = header.offsetHeight + 18;
      const heroBottom = hero.getBoundingClientRect().bottom;
      header.classList.toggle("header-outside-hero", heroBottom <= cutoff);

      const revealLine = window.innerHeight * 0.88;

      targets.forEach((element) => {
        if (element.classList.contains("motion-in")) return;

        const rect = element.getBoundingClientRect();
        const hasEnteredViewport = rect.top <= revealLine && rect.bottom >= 0;

        if (hasEnteredViewport) {
          element.classList.add("motion-in");
        }
      });
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePageMotion);
    };

    const scrollToJami = (event: MouseEvent) => {
      if (!story) return;

      event.preventDefault();
      event.stopPropagation();

      window.cancelAnimationFrame(meetJamiScrollFrame);

      const startY = window.scrollY;
      const targetY = story.getBoundingClientRect().top + window.scrollY;
      const distance = targetY - startY;
      const duration = Math.min(1500, Math.max(1050, Math.abs(distance) * 0.22));
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          meetJamiScrollFrame = window.requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);
        }
      };

      meetJamiScrollFrame = window.requestAnimationFrame(step);
    };

    // Allow one paint with the initial hidden/offset state before revealing any
    // elements already near the viewport. This guarantees a visible transition
    // instead of the classes being applied and resolved in the same paint.
    primingFrame = window.requestAnimationFrame(() => {
      primingFrameTwo = window.requestAnimationFrame(updatePageMotion);
    });

    meetJamiButton?.addEventListener("click", scrollToJami);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(primingFrame);
      window.cancelAnimationFrame(primingFrameTwo);
      window.cancelAnimationFrame(meetJamiScrollFrame);
      meetJamiButton?.removeEventListener("click", scrollToJami);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      header.classList.remove("header-outside-hero");
      html.classList.remove("motion-ready");

      targets.forEach((element) => {
        element.classList.remove("motion-reveal", "motion-heading", "motion-card", "motion-image", "motion-in");
        element.style.removeProperty("--motion-delay");
      });
    };
  }, []);

  return null;
}
