"use client";

import { ArrowRight, CalendarDays, Check, Clock3, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SUPABASE_URL, supabaseHeaders } from "../../../lib/supabaseConfig";

type BookingCardProps = { slug: string; name: string; guests: number };
type FormState = { checkIn: string; checkOut: string; guests: string; fullName: string; email: string; phone: string; message: string; website: string };
type PropertyConfig = { id: string; min_nights: number; max_nights: number };

function localDate(daysFromToday = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function stayDates(checkIn: string, checkOut: string) {
  const dates: string[] = [];
  for (let date = checkIn; date && date < checkOut; date = addDays(date, 1)) dates.push(date);
  return dates;
}

export default function BookingCard({ slug, name, guests }: BookingCardProps) {
  const [form, setForm] = useState<FormState>({ checkIn: "", checkOut: "", guests: "2", fullName: "", email: "", phone: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [availabilityStatus, setAvailabilityStatus] = useState<"loading" | "ready" | "unavailable" | "error">("loading");
  const [property, setProperty] = useState<PropertyConfig | null>(null);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const minNights = property?.min_nights ?? 5;
  const maxNights = property?.max_nights ?? 60;
  const minCheckIn = localDate();
  const minCheckOut = form.checkIn ? addDays(form.checkIn, minNights) : localDate(minNights);
  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    return Math.max(0, Math.round((Date.parse(form.checkOut) - Date.parse(form.checkIn)) / 86400000));
  }, [form.checkIn, form.checkOut]);
  const conflictingDate = useMemo(
    () => stayDates(form.checkIn, form.checkOut).find((date) => blockedDates.has(date)),
    [blockedDates, form.checkIn, form.checkOut],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      setAvailabilityStatus("loading");
      try {
        const propertyResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=id,min_nights,max_nights&limit=1`,
          { headers: supabaseHeaders() },
        );
        if (!propertyResponse.ok) throw new Error("Property unavailable");
        const [config] = (await propertyResponse.json()) as PropertyConfig[];
        if (!config) throw new Error("Property unavailable");

        const through = localDate(730);
        const calendarResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/booking_calendar?property_id=eq.${config.id}&stay_date=gte.${localDate()}&stay_date=lte.${through}&select=stay_date`,
          { headers: supabaseHeaders() },
        );
        if (!calendarResponse.ok) throw new Error("Calendar unavailable");
        const rows = (await calendarResponse.json()) as { stay_date: string }[];
        if (!cancelled) {
          setProperty(config);
          setBlockedDates(new Set(rows.map((row) => row.stay_date)));
          setAvailabilityStatus("ready");
        }
      } catch {
        if (!cancelled) setAvailabilityStatus("error");
      }
    }
    loadAvailability();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!form.checkIn || !form.checkOut || availabilityStatus === "loading" || availabilityStatus === "error") return;
    setAvailabilityStatus(conflictingDate ? "unavailable" : "ready");
  }, [availabilityStatus, conflictingDate, form.checkIn, form.checkOut]);

  function update(field: keyof FormState, value: string) {
    setError("");
    setForm((current) => {
      if (field === "checkIn") {
        const earliestCheckout = value ? addDays(value, minNights) : "";
        return { ...current, checkIn: value, checkOut: current.checkOut && current.checkOut >= earliestCheckout ? current.checkOut : earliestCheckout };
      }
      return { ...current, [field]: value };
    });
  }

  async function refreshSelectedAvailability() {
    if (!property || !form.checkIn || !form.checkOut) return false;
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/booking_calendar?property_id=eq.${property.id}&stay_date=gte.${form.checkIn}&stay_date=lt.${form.checkOut}&select=stay_date&limit=1`,
      { headers: supabaseHeaders() },
    );
    if (!response.ok) throw new Error("Availability check failed");
    const rows = (await response.json()) as { stay_date: string }[];
    return rows.length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (form.website) return;
    if (!property || availabilityStatus === "loading" || availabilityStatus === "error") {
      setError("Availability is still loading. Please try again in a moment.");
      return;
    }
    if (nights < minNights || nights > maxNights) {
      setError(`This property requires ${minNights}–${maxNights} nights per stay.`);
      return;
    }
    if (conflictingDate) {
      setError("One or more selected nights are unavailable. Please choose different dates.");
      return;
    }

    setStatus("submitting");
    try {
      if (!(await refreshSelectedAvailability())) {
        setAvailabilityStatus("unavailable");
        throw new Error("Dates unavailable");
      }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/booking_requests`, {
        method: "POST",
        headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          property_id: property.id,
          property_slug: slug,
          property_name: name,
          check_in: form.checkIn,
          check_out: form.checkOut,
          guests: Number(form.guests),
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          message: form.message.trim() || null,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setError("We couldn’t send your request. Check the dates and contact details, then try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return <div className="property-booking-card booking-card-success" aria-live="polite">
      <div className="property-success-icon"><Check size={24} /></div>
      <p className="property-mini-label">Request received</p>
      <h3>Jami will be in touch.</h3>
      <p>Your request for {name} has been saved. Pacific Stay will confirm availability, pricing, and next steps using the contact information you provided.</p>
      <button type="button" onClick={() => setStatus("idle")}>Send another request</button>
    </div>;
  }

  return <form className="property-booking-card" onSubmit={submit}>
    <div className="property-booking-intro">
      <p className="property-mini-label">Book directly with Pacific Stay</p>
      <div className="property-rate-line current-booking-heading"><strong>Plan your stay</strong></div>
      <p>Choose your dates and send a request. Jami will personally confirm the details and final price before anything is reserved.</p>
    </div>
    <div className="property-booking-facts" aria-label="Booking details">
      <span><Clock3 size={15} /><strong>{minNights}+ nights</strong><small>Minimum stay</small></span>
      <span><Users size={15} /><strong>Up to {guests}</strong><small>Guests</small></span>
      <span><ShieldCheck size={15} /><strong>No payment</strong><small>Until confirmed</small></span>
    </div>
    <div className={`property-availability-status status-${availabilityStatus}`} aria-live="polite">
      {availabilityStatus === "loading" && <><LoaderCircle size={14} className="spin" /> Loading availability…</>}
      {availabilityStatus === "ready" && <><Check size={14} /> Availability connected</>}
      {availabilityStatus === "unavailable" && <>Selected dates include an unavailable night</>}
      {availabilityStatus === "error" && <>Live availability is temporarily unavailable</>}
    </div>
    <div className="property-booking-fields">
      <label><span><CalendarDays size={15} /> Check-in</span><input type="date" min={minCheckIn} value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} required /></label>
      <label><span><CalendarDays size={15} /> Check-out</span><input type="date" min={minCheckOut} value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} required /></label>
      <label className="property-guests-field"><span><Users size={15} /> Guests</span><select value={form.guests} onChange={(e) => update("guests", e.target.value)}>{Array.from({ length: guests }, (_, i) => i + 1).map((guest) => <option key={guest} value={guest}>{guest} guest{guest === 1 ? "" : "s"}</option>)}</select></label>
    </div>
    <div className="property-form-divider"><span>Your information</span></div>
    <div className="property-contact-fields">
      <label><span>Full name</span><input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" maxLength={100} required /></label>
      <label><span>Email</span><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" maxLength={254} required /></label>
      <label><span>Phone</span><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" maxLength={30} required /></label>
      <label><span>Message <small>(optional)</small></span><textarea value={form.message} onChange={(e) => update("message", e.target.value)} maxLength={1500} rows={3} /></label>
      <label className="booking-honeypot" aria-hidden="true"><span>Website</span><input value={form.website} onChange={(e) => update("website", e.target.value)} tabIndex={-1} autoComplete="off" /></label>
    </div>
    {nights > 0 && <div className="property-stay-summary">
      <div><span>Selected stay</span><strong>{nights} night{nights === 1 ? "" : "s"}</strong></div>
      <div><span>Guests</span><strong>{form.guests}</strong></div>
      <div><span>Price</span><strong>Confirmed by host</strong></div>
    </div>}
    {error && <p className="property-booking-error" role="alert">{error}</p>}
    <button className="property-book-button" type="submit" disabled={status === "submitting" || availabilityStatus === "loading" || availabilityStatus === "error" || Boolean(conflictingDate)}>{status === "submitting" ? "Sending request…" : <>Request to book <ArrowRight size={17} /></>}</button>
    <small>This is a booking request, not an automatic reservation. Pacific Stay will confirm availability and pricing with you directly.</small>
  </form>;
}
