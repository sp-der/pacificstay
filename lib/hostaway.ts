export const HOSTAWAY_BOOKING_BASE_URL = "https://pacificstayproperties.holidayfuture.com/";

const HOSTAWAY_PROPERTY_SLUGS = new Set([
  "beach-baby-oceanfront-escape",
]);

export function isHostawayProperty(slug: string): boolean {
  return HOSTAWAY_PROPERTY_SLUGS.has(slug);
}
