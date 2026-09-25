"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Check, Search, ShieldCheck, Users } from "lucide-react";
import { HOSTAWAY_BOOKING_BASE_URL } from "../../../lib/hostaway";
import styles from "./book.module.css";

type Props = {
  propertyName: string;
  maxGuests: number;
};

function localDate(daysFromToday = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

export default function HostawaySearch({ propertyName, maxGuests }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [error, setError] = useState("");

  const today = useMemo(() => localDate(), []);
  const minimumCheckout = checkIn || today;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!checkIn || !checkOut) {
      setError("Choose both check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    const url = new URL(HOSTAWAY_BOOKING_BASE_URL);
    url.searchParams.set("start", checkIn);
    url.searchParams.set("end", checkOut);
    url.searchParams.set("numberOfGuests", guests);
    window.location.assign(url.toString());
  }

  return (
    <div className={styles.hostawayCard}>
      <div className={styles.hostawayHeading}>
        <div>
          <p>Live Hostaway availability</p>
          <h3>Choose your dates</h3>
        </div>
        <span className={styles.hostawayLiveTag}>
          <Check size={13} /> Connected
        </span>
      </div>

      <p className={styles.hostawayIntro}>
        Continue to Pacific Stay&apos;s published Hostaway booking site for live availability for {propertyName}. Your selected dates and guest count are included in the handoff.
      </p>

      <form className={styles.hostawayDirectSearch} onSubmit={submit}>
        <label>
          <span><CalendarDays size={16} /> Check-in</span>
          <input
            type="date"
            name="start"
            min={today}
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value);
              if (checkOut && checkOut <= event.target.value) setCheckOut("");
            }}
            required
          />
        </label>

        <label>
          <span><CalendarDays size={16} /> Check-out</span>
          <input
            type="date"
            name="end"
            min={minimumCheckout}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            required
          />
        </label>

        <label>
          <span><Users size={16} /> Guests</span>
          <select name="numberOfGuests" value={guests} onChange={(event) => setGuests(event.target.value)}>
            {Array.from({ length: Math.max(1, maxGuests) }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>{count} guest{count === 1 ? "" : "s"}</option>
            ))}
          </select>
        </label>

        <button type="submit">
          <Search size={17} />
          Continue to Hostaway
        </button>
      </form>

      {error && <p className={styles.hostawayDirectError} role="alert">{error}</p>}

      <div className={styles.hostawaySecurity}>
        <ShieldCheck size={16} />
        <span>Hostaway handles live availability, pricing, reservation details, and secure checkout.</span>
      </div>
    </div>
  );
}
