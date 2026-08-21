"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PropertyLinkEnhancer() {
  const router = useRouter();

  useEffect(() => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".stay-card .text-link")
    );
    const slugs = ["pacific-house", "salt-sand-retreat"];
    const cleanups: Array<() => void> = [];

    buttons.forEach((button, index) => {
      const slug = slugs[index];
      if (!slug) return;

      const handler = () => router.push(`/properties/${slug}`);
      button.addEventListener("click", handler);
      button.setAttribute("aria-label", `View property ${index + 1}`);
      cleanups.push(() => button.removeEventListener("click", handler));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [router]);

  return null;
}
