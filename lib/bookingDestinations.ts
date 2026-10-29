import { getHostawayListingId } from "./hostaway";

/**
 * A newly imported listing is public, but it is not yet connected to
 * Pacific Stay's direct-booking inventory, rates, or calendar.
 * Route guests to its verified Airbnb page until Hostaway is configured.
 */
export function getExternalBookingUrl(slug: string, casaDirectReady = false): string | null {
  if (slug === "casa-del-cactus" && !casaDirectReady && !getHostawayListingId(slug)) {
    return "https://www.airbnb.com/rooms/1798660872755121079";
  }
  return null;
}
