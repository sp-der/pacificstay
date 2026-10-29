# Casa Del Cactus import — October 28, 2026

Public Airbnb listing: https://www.airbnb.com/rooms/1798660872755121079
Pacific Stay property slug: `casa-del-cactus`

## Verified public listing information

- Listing title: **Casa Del Cactus, Charming Hideaway**.
- Host: Jami Jimenez.
- Airbnb lists the entire home in **Vista, California**. One listing highlight refers to San Marcos, so the website uses the explicit Vista location rather than claiming a precise address.
- Capacity: **5 guests, 2 bedrooms, 4 beds, 1 bath**. The listing's JSON-LD occupancy field differs from the main displayed guest capacity; the website follows the visible primary listing.
- Features: privately gated renovated home, cacti and trees, patio, outdoor seating, barbecue/deck, kitchen, coffee maker, cooking basics, Wi-Fi, dedicated workspace, TV, washer/dryer, air conditioning, free parking, hair dryer.
- Public rules and safety: check-in after 4 PM, checkout before 11 AM, exterior cameras, carbon monoxide and smoke alarms. Other rules remain on Airbnb.
- At import time the listing had no reviews or verified listing rating. Do not replace this with the host's separate overall rating.
- 30 unique gallery photos were collected from the current Airbnb photo tour and stored under `public/new-listing-1798660872755121079/`. A manifest of source URLs and hashes is in `new-listing-1798660872755121079-photos.json`.

## Publication and booking controls

The public website temporarily uses a **new-property fallback** if Supabase has no active `casa-del-cactus` row. This does not alter Chestnut or Beach Baby records.

The owner dashboard provides **Import Casa Del Cactus**, pre-filling a draft that the authenticated owner can save through Supabase's existing row-level authorization. Once published, its database record takes precedence.

Until a Hostaway listing is explicitly configured for this slug, the website **sends guests to Airbnb**, not to the direct-booking form. Never imply Pacific Stay has synchronized availability, direct pricing, fees, minimum-night requirements, or payment processing for this property before those are configured.

The photo count and static fallback should be revisited after the owner has imported and activated the managed record. Unpublishing a database row does not automatically disable the temporary code-based fallback.

## Source hygiene

This import was limited to publicly visible listing facts. Precise guest addresses, check-in codes, guest identities, private calendar URLs, and payment details were not extracted. Temporary scraping workflow and large copied page text must not be retained in the production code.
