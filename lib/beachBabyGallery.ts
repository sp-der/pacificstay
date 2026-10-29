import type { PhotoTourSection } from "../app/properties/photoTourData";

/**
 * One-time compatibility bridge for the October 2026 Beach Baby photo refresh.
 *
 * Pacific Stay stores owner-managed gallery content in Supabase. The previous
 * Airbnb import stored 20 numbered files in that record. When we see exactly
 * that untouched legacy 20-photo sequence, display all 42 refreshed files
 * instead. Any owner-edited gallery takes precedence and is never replaced.
 */
const BEACH_BABY_SLUG = "beach-baby-oceanfront-escape";
const REFRESH_VERSION = "20261028";
const legacyPhotoPaths = Array.from({ length: 20 }, (_, i) =>
  "/beach-baby/beach-baby-" + String(i + 1).padStart(2, "0") + ".webp"
);
const refreshedPhotoPaths = Array.from({ length: 42 }, (_, i) =>
  "/beach-baby/beach-baby-" + String(i + 1).padStart(2, "0") + ".webp?v=" + REFRESH_VERSION
);

type GalleryContent = {
  heroImage?: string;
  gallery?: string[];
  photoTour?: PhotoTourSection[];
};

export function refreshLegacyBeachBabyGallery<T extends GalleryContent>(
  slug: string,
  content: T,
): T {
  if (slug !== BEACH_BABY_SLUG) return content;

  const existing = content.photoTour?.flatMap((section) => section.images) ?? [];
  const isUnchangedLegacyGallery =
    existing.length === legacyPhotoPaths.length &&
    existing.every((image, i) => image === legacyPhotoPaths[i]);

  if (!isUnchangedLegacyGallery) return content;

  const updatedTour: PhotoTourSection[] = [
    {
      id: "property-tour",
      label: "Beach Baby",
      thumbnail: refreshedPhotoPaths[0],
      images: [...refreshedPhotoPaths],
    },
  ];

  return {
    ...content,
    heroImage: refreshedPhotoPaths[0],
    gallery: refreshedPhotoPaths.slice(1, 4),
    photoTour: updatedTour,
  };
}
