export const HOSTAWAY_BOOKING_BASE_URL = "https://pacificstayproperties.holidayfuture.com/";

export const HOSTAWAY_LISTINGS = {
  "beach-baby-oceanfront-escape": 591608,
} as const;

export function getHostawayListingId(slug: string): number | undefined {
  return HOSTAWAY_LISTINGS[slug as keyof typeof HOSTAWAY_LISTINGS];
}
