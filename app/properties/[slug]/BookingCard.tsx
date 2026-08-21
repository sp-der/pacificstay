"use client";

import { ArrowRight, CalendarDays, Check, Users } from "lucide-react";
import { FormEvent, useState } from "react";

type BookingCardProps = {
  name: string;
  price: number;
  guests: number;
};

export default function BookingCard({ name, price, guests }: BookingCardProps) {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="property-booking-card booking-card-success">
        <div className="property-success-icon"><Check size={24} /></div>
        <p className="property-mini-label">Demo request received</p>
        <h3>That&apos;s the guest flow.</h3>
        <p>
          The production version can connect this step to live availability,
          taxes, cleaning fees, agreements, and payment through Pacific Stay&apos;s
          final booking provider.
        </p>
        <button type="button" onClick={() => setSubmitted(false)}>
          Back to dates
        </button>
      </div>
    );
  }

  return (
    <form className="property-booking-card" onSubmit={submit}>
      <p className="property-mini-label">Mock direct booking</p>
      <div className="property-rate-line">
        <strong>${price}</strong>
        <span>/ night sample rate</span>
      </div>

      <div className="property-booking-fields">
        <label>
          <span><CalendarDays size={15} /> Check-in</span>
          <input type="date" required />
        </label>
        <label>
          <span><CalendarDays size={15} /> Check-out</span>
          <input type="date" required />
        </label>
        <label className="property-guests-field">
          <span><Users size={15} /> Guests</span>
          <select defaultValue="2">
            {Array.from({ length: guests }, (_, index) => index + 1).map((guest) => (
              <option key={guest} value={guest}>
                {guest} guest{guest === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="property-price-preview">
        <div><span>3 nights × ${price}</span><strong>${price * 3}</strong></div>
        <div><span>Cleaning fee</span><strong>Added later</strong></div>
        <div><span>Taxes</span><strong>Added later</strong></div>
        <div className="property-price-total"><span>Demo subtotal</span><strong>${price * 3}</strong></div>
      </div>

      <button className="property-book-button" type="submit">
        Request to book {name} <ArrowRight size={17} />
      </button>
      <small>No payment is collected in this presentation mock.</small>
    </form>
  );
}
