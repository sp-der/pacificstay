# Beach Baby import — September 15, 2026

Source: https://www.airbnb.com/rooms/1763283615794372898

- Display name: Beach Baby, Oceanfront Escape.
- Structured listing: 8 guests, 3 bedrooms, 4 beds, 3 bathrooms, entire home in Oceanside. The title's “Sleeps6” is superseded by the structured capacity and description.
- All 20 gallery originals downloaded (approximately 2,300 pixels wide), checked for duplicate decoded content and visually reviewed. Distinct angles retained in Airbnb gallery order. Published as 2,000-pixel WebP, quality 84, with no photographic alterations.
- All 22 amenities, listing description/highlights, check-in/out and house rules imported.
- Airbnb's September/October calendar shows a 3-night minimum. The application's existing 60-night maximum is an operational default, not an Airbnb-extracted fact.
- No reviews yet. No rating, bed sizes, precise address, or check-in credentials were invented.
- Direct rates, cleaning fee, tax and cancellation terms remain unset for Jami to configure. Airbnb cancellation terms require selected dates and are not assumed to govern direct bookings.
- The private Airbnb iCal export URL is not publicly available. Calendar sync must be connected through the existing integration setup before accepting direct bookings.

## Repeatable import

`beach-baby.json` records the initial shared-property payload. `beach-baby.sql` inserts a private draft without overwriting any existing property or owner edits. Deploy `public/beach-baby` before publishing this draft through the existing owner editor. `beach-baby-photos.json` records original image URLs, dimensions, and decoded-content checksums. Runtime image URLs are local; Airbnb is never hotlinked.

The database is the runtime source of truth. Future owner edits use the same property editor, photos, policies, prices, and availability controls as Chestnut. No additional hardcoded property registration is required.
