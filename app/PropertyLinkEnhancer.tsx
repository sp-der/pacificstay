"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const propertyRoutes: Record<string, string> = {
  "The Pacific House": "/properties/pacific-house",
  "Salt + Sand Retreat": "/properties/salt-sand-retreat",
};

export default function PropertyLinkEnhancer() {
  const router = useRouter();

  useEffect(() => {
    function handlePropertyClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(".stay-card .text-link") as HTMLElement | null;

      if (!button) return;

      const card = button.closest(".stay-card");
      const propertyName = card?.querySelector("h3")?.textContent?.trim();
      const route = propertyName ? propertyRoutes[propertyName] : undefined;

      if (!route) return;

      event.preventDefault();
      router.push(route);
    }

    document.addEventListener("click", handlePropertyClick);

    return () => {
      document.removeEventListener("click", handlePropertyClick);
    };
  }, [router]);

  return null;
}
