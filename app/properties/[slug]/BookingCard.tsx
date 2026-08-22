"use client";

import { ArrowRight, CalendarDays, ExternalLink, Users } from "lucide-react";

type BookingCardProps = {
  name: string;
  guests: number;
  airbnbUrl: string;
};

export default function BookingCard({ name, guests, airbnbUrl }: BookingCardProps) {
  return (
    <div className="property-booking-card current-booking-card">
      <p className="property-mini-label">Current availability</p>
      <div className="property-rate-line current-booking-heading">
        <strong>Book your stay</strong>
      </div>

      <div className="current-booking-facts">
        <div><CalendarDays size={18} /><span>Live dates and current pricing</span></div>
        <div><Users size={18} /><span>Up to {guests} guests</span></div>
      </div>

      <p className="current-booking-copy">
        Pacific Stay&apos;s direct booking and payment system is now being connected.
        Until that launches, current availability, rates, and reservations for {name}
        remain available through the property&apos;s active Airbnb listing.
      </p>

      <a className="property-book-button" href={airbnbUrl} target="_blank" rel="noreferrer">
        Check live availability <ExternalLink size={17} />
      </a>

      <small>Direct booking through Pacific Stay is coming next.</small>
    </div>
  );
}
