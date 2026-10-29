"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Users } from "lucide-react";
import { getHostawayListingId } from "../../../lib/hostaway";
import { getExternalBookingUrl } from "../../../lib/bookingDestinations";

type BookingCardProps = { slug: string; name: string; guests: number; casaDirectReady?: boolean };

export default function BookingCard({ slug, name, guests, casaDirectReady = false }: BookingCardProps) {
  const hostawayEnabled = Boolean(getHostawayListingId(slug));
  const airbnbBookingUrl = getExternalBookingUrl(slug, casaDirectReady);

  if (airbnbBookingUrl) {
    return (
      <div className="property-booking-card current-booking-card">
        <p className="property-mini-label">Reserve your stay</p>
        <div className="property-rate-line current-booking-heading">
          <strong>Plan your getaway</strong>
        </div>
        <div className="current-booking-facts">
          <div><CalendarDays size={18} /><span>View live dates and pricing on Airbnb</span></div>
          <div><Users size={18} /><span>Up to {guests} guests</span></div>
          <div><ShieldCheck size={18} /><span>Locally managed by Pacific Stay</span></div>
        </div>
        <p className="current-booking-copy">
          Check availability and book {name} through the verified Airbnb listing.
          Direct booking is not yet configured for this property.
        </p>
        <a className="property-book-button" href={airbnbBookingUrl} target="_blank" rel="noopener noreferrer">
          Check dates on Airbnb <ArrowRight size={17} />
        </a>
        <small>Availability, payment, and booking terms are provided by Airbnb.</small>
      </div>
    );
  }

  return (
    <div className="property-booking-card current-booking-card">
      <p className="property-mini-label">Book directly with Pacific Stay</p>
      <div className="property-rate-line current-booking-heading">
        <strong>Plan your stay</strong>
      </div>

      <div className="current-booking-facts">
        <div><CalendarDays size={18} /><span>{hostawayEnabled ? "Live Hostaway availability and checkout" : "Live availability and direct pricing"}</span></div>
        <div><Users size={18} /><span>Up to {guests} guests</span></div>
        <div><ShieldCheck size={18} /><span>Local booking support from Jami</span></div>
      </div>

      <p className="current-booking-copy">
        {hostawayEnabled
          ? `Check live dates for ${name} and continue through Pacific Stay's secure Hostaway booking flow.`
          : `View dates, estimated pricing, taxes, house rules, and guest details on Pacific Stay&apos;s dedicated direct-booking page for ${name}.`}
      </p>

      <Link className="property-book-button" href={`/book/${slug}`}>
        {hostawayEnabled ? "Check dates & book" : "Book direct"} <ArrowRight size={17} />
      </Link>

      <small>{hostawayEnabled ? "Availability and checkout are powered by Hostaway." : "No payment is collected until the stay details are confirmed."}</small>
    </div>
  );
}
