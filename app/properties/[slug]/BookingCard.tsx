"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Users } from "lucide-react";

type BookingCardProps = { slug: string; name: string; guests: number };

export default function BookingCard({ slug, name, guests }: BookingCardProps) {
  return (
    <div className="property-booking-card current-booking-card">
      <p className="property-mini-label">Book directly with Pacific Stay</p>
      <div className="property-rate-line current-booking-heading">
        <strong>Plan your stay</strong>
      </div>

      <div className="current-booking-facts">
        <div><CalendarDays size={18} /><span>Live availability and direct pricing</span></div>
        <div><Users size={18} /><span>Up to {guests} guests</span></div>
        <div><ShieldCheck size={18} /><span>Local booking support from Jami</span></div>
      </div>

      <p className="current-booking-copy">
        View dates, estimated pricing, taxes, house rules, and guest details on Pacific Stay&apos;s dedicated direct-booking page for {name}.
      </p>

      <Link className="property-book-button" href={`/book/${slug}`}>
        Book direct <ArrowRight size={17} />
      </Link>

      <small>No payment is collected until the stay details are confirmed.</small>
    </div>
  );
}
