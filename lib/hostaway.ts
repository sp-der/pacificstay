// Verified public Hostaway Booking Website domain (the old value omitted the "i" in Pacific).
export const HOSTAWAY_BOOKING_BASE_URL = "https://pacificstayproperties.holidayfuture.com/";

export const HOSTAWAY_LISTINGS = {
  "beach-baby-oceanfront-escape": 591608,
} as const;

function optionalListingId(raw: string | undefined): number | undefined {
  if (!raw || !/^[1-9][0-9]*$/.test(raw)) return undefined;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : undefined;
}

/**
 * Chestnut and Casa can be switched to Hostaway when Jami has assigned
 * their real listing IDs and included them on the published booking website.
 * No code change is required for the eventual migration.
 */
export function getHostawayListingId(slug: string): number | undefined {
  if (slug === "beach-baby-oceanfront-escape") return HOSTAWAY_LISTINGS["beach-baby-oceanfront-escape"];
  if (slug === "chestnut-by-the-sea") return optionalListingId(process.env.NEXT_PUBLIC_HOSTAWAY_CHESTNUT_LISTING_ID);
  if (slug === "casa-del-cactus") return optionalListingId(process.env.NEXT_PUBLIC_HOSTAWAY_CASA_LISTING_ID);
  return undefined;
}
