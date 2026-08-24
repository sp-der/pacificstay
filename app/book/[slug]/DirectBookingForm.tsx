"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { SUPABASE_URL, supabaseHeaders } from "../../../lib/supabaseConfig";
import styles from "./book.module.css";

type Props = { slug: string; name: string; maxGuests: number };
type PropertyConfig = {
  id: string;
  min_nights: number;
  max_nights: number;
  base_nightly_rate: number | null;
  weekend_nightly_rate: number | null;
  cleaning_fee: number | null;
  tax_rate: number | null;
};
type RateOverride = { stay_date: string; nightly_rate: number; min_nights: number | null };
type FormState = {
  checkIn: string;
  checkOut: string;
  guests: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  noPets: boolean;
  requestAgreement: boolean;
  website: string;
};

const FALLBACK_BASE_RATE = 861;
const FALLBACK_WEEKEND_RATE = 1488;
const FALLBACK_CLEANING_FEE = 250;
const CARLSBAD_TOT_RATE = 0.1;
const CARLSBAD_CTBID_RATE = 0.02;

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

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function isWeekendNight(value: string) {
  const day = new Date(`${value}T12:00:00`).getDay();
  return day === 5 || day === 6;
}

export default function DirectBookingForm({ slug, name, maxGuests }: Props) {
  const [form, setForm] = useState<FormState>({
    checkIn: "", checkOut: "", guests: "2", fullName: "", email: "", phone: "", message: "",
    noPets: false, requestAgreement: false, website: "",
  });
  const [property, setProperty] = useState<PropertyConfig | null>(null);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [rateOverrides, setRateOverrides] = useState<Map<string, RateOverride>>(new Map());
  const [availabilityStatus, setAvailabilityStatus] = useState<"loading" | "ready" | "unavailable" | "error">("loading");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const minNights = property?.min_nights ?? 5;
  const maxNights = property?.max_nights ?? 60;
  const minCheckIn = localDate();
  const maxBookableDate = localDate(365);
  const minCheckOut = form.checkIn ? addDays(form.checkIn, minNights) : localDate(minNights);
  const dates = useMemo(() => stayDates(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const nights = dates.length;
  const conflictingDate = dates.find((date) => blockedDates.has(date));

  const quote = useMemo(() => {
    if (!dates.length) return null;
    const baseRate = Number(property?.base_nightly_rate ?? FALLBACK_BASE_RATE);
    const weekendRate = Number(property?.weekend_nightly_rate ?? FALLBACK_WEEKEND_RATE);
    const cleaningFee = Number(property?.cleaning_fee ?? FALLBACK_CLEANING_FEE);
    const nightlySubtotal = dates.reduce((total, date) => {
      const override = rateOverrides.get(date);
      if (override) return total + Number(override.nightly_rate);
      return total + (isWeekendNight(date) ? weekendRate : baseRate);
    }, 0);
    const taxable = nightlySubtotal + cleaningFee;
    const tot = Math.round(taxable * CARLSBAD_TOT_RATE * 100) / 100;
    const ctbid = Math.round(taxable * CARLSBAD_CTBID_RATE * 100) / 100;
    return { nightlySubtotal, cleaningFee, tot, ctbid, total: taxable + tot + ctbid };
  }, [dates, property, rateOverrides]);

  useEffect(() => {
    let cancelled = false;
    async function loadBookingData() {
      setAvailabilityStatus("loading");
      try {
        const propertyResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=id,min_nights,max_nights,base_nightly_rate,weekend_nightly_rate,cleaning_fee,tax_rate&limit=1`,
          { headers: supabaseHeaders() },
        );
        if (!propertyResponse.ok) throw new Error("Property unavailable");
        const [config] = (await propertyResponse.json()) as PropertyConfig[];
        if (!config) throw new Error("Property unavailable");

        const [calendarResponse, rateResponse] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/booking_calendar?property_id=eq.${config.id}&stay_date=gte.${localDate()}&stay_date=lte.${maxBookableDate}&select=stay_date`, { headers: supabaseHeaders() }),
          fetch(`${SUPABASE_URL}/rest/v1/nightly_rates?property_id=eq.${config.id}&stay_date=gte.${localDate()}&stay_date=lte.${maxBookableDate}&select=stay_date,nightly_rate,min_nights`, { headers: supabaseHeaders() }),
        ]);
        if (!calendarResponse.ok || !rateResponse.ok) throw new Error("Calendar unavailable");
        const calendarRows = (await calendarResponse.json()) as { stay_date: string }[];
        const rateRows = (await rateResponse.json()) as RateOverride[];
        if (!cancelled) {
          setProperty(config);
          setBlockedDates(new Set(calendarRows.map((row) => row.stay_date)));
          setRateOverrides(new Map(rateRows.map((row) => [row.stay_date, row])));
          setAvailabilityStatus("ready");
        }
      } catch {
        if (!cancelled) setAvailabilityStatus("error");
      }
    }
    loadBookingData();
    return () => { cancelled = true; };
  }, [slug, maxBookableDate]);

  useEffect(() => {
    if (!form.checkIn || !form.checkOut || availabilityStatus === "loading" || availabilityStatus === "error") return;
    setAvailabilityStatus(conflictingDate ? "unavailable" : "ready");
  }, [conflictingDate, form.checkIn, form.checkOut, availabilityStatus]);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setError("");
    setForm((current) => {
      if (field === "checkIn" && typeof value === "string") {
        const earliest = value ? addDays(value, minNights) : "";
        return { ...current, checkIn: value, checkOut: current.checkOut && current.checkOut >= earliest ? current.checkOut : earliest };
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
    return ((await response.json()) as { stay_date: string }[]).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (form.website) return;
    if (!property || availabilityStatus === "loading" || availabilityStatus === "error") return setError("Availability is still loading. Please try again in a moment.");
    if (!form.checkIn || !form.checkOut || form.checkIn > maxBookableDate || form.checkOut > maxBookableDate) return setError("Stays can be requested up to 12 months in advance.");
    if (nights < minNights || nights > maxNights) return setError(`This property requires ${minNights}–${maxNights} nights per stay.`);
    const requiredOverrideMinimum = Math.max(...dates.map((date) => rateOverrides.get(date)?.min_nights ?? minNights), minNights);
    if (nights < requiredOverrideMinimum) return setError(`The selected dates require at least ${requiredOverrideMinimum} nights.`);
    if (conflictingDate) return setError("One or more selected nights are unavailable. Please choose different dates.");
    if (!form.noPets || !form.requestAgreement) return setError("Please confirm the booking acknowledgements before continuing.");

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
          message: [form.message.trim(), quote ? `Estimated direct total at request: ${money(quote.total)}` : ""].filter(Boolean).join("\n\n") || null,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("We couldn’t send your booking request. Please review the dates and contact information, then try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successCard} aria-live="polite">
        <div><Check size={26} /></div>
        <p>Request received</p>
        <h3>Your stay request is with Pacific Stay.</h3>
        <p>Jami will review the dates and final pricing before the reservation is confirmed. No payment has been collected yet.</p>
        <a href={`mailto:info@pacificstayproperties.com?subject=${encodeURIComponent(`Booking request for ${name}`)}`}>Need to add something? Email Pacific Stay</a>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={submit}>
      <div className={styles.formHeading}>
        <div><p>Direct stay request</p><h3>Choose your dates</h3></div>
        <div className={`${styles.liveStatus} ${styles[availabilityStatus]}`}>
          {availabilityStatus === "loading" && <><LoaderCircle size={13} className={styles.spin} /> Syncing calendar</>}
          {availabilityStatus === "ready" && <><Check size={13} /> Calendar connected</>}
          {availabilityStatus === "unavailable" && <>Dates unavailable</>}
          {availabilityStatus === "error" && <>Calendar temporarily unavailable</>}
        </div>
      </div>

      <div className={styles.dateGrid}>
        <label><span><CalendarDays size={15} /> Check-in</span><input type="date" min={minCheckIn} max={maxBookableDate} value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} required /></label>
        <label><span><CalendarDays size={15} /> Check-out</span><input type="date" min={minCheckOut} max={maxBookableDate} value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} required /></label>
        <label><span><Users size={15} /> Guests</span><select value={form.guests} onChange={(e) => update("guests", e.target.value)}>{Array.from({ length: maxGuests }, (_, index) => index + 1).map((guest) => <option key={guest} value={guest}>{guest} guest{guest === 1 ? "" : "s"}</option>)}</select></label>
      </div>

      {quote && nights > 0 && (
        <div className={styles.quote}>
          <div className={styles.quoteTop}><span>Estimated direct price</span><strong>{money(quote.total)}</strong></div>
          <div><span>{nights} nights</span><strong>{money(quote.nightlySubtotal)}</strong></div>
          <div><span>Cleaning fee</span><strong>{money(quote.cleaningFee)}</strong></div>
          <div><span>Carlsbad TOT (10%)</span><strong>{money(quote.tot)}</strong></div>
          <div><span>CTBID assessment (2%)</span><strong>{money(quote.ctbid)}</strong></div>
          <small>Estimate only. Seasonal/manual nightly adjustments from Pacific Stay override the standard $861 weekday and $1,488 weekend rates.</small>
        </div>
      )}

      <div className={styles.divider}><span>Guest information</span></div>
      <div className={styles.contactGrid}>
        <label><span>Full name</span><input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" maxLength={100} required /></label>
        <label><span>Email</span><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" maxLength={254} required /></label>
        <label><span>Phone</span><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" maxLength={30} required /></label>
        <label className={styles.fullWidth}><span>Message <small>(optional)</small></span><textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={3} maxLength={1500} placeholder="Arrival notes, questions, or anything Jami should know." /></label>
        <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input value={form.website} onChange={(e) => update("website", e.target.value)} tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className={styles.acknowledgements}>
        <label><input type="checkbox" checked={form.noPets} onChange={(e) => update("noPets", e.target.checked)} /><span><ShieldCheck size={15} /> I understand that Chestnut By the Sea does not allow pets.</span></label>
        <label><input type="checkbox" checked={form.requestAgreement} onChange={(e) => update("requestAgreement", e.target.checked)} /><span><ShieldCheck size={15} /> I understand this is a stay request. The reservation and final price are not confirmed until Pacific Stay approves the request.</span></label>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} type="submit" disabled={status === "submitting" || availabilityStatus === "loading" || availabilityStatus === "error" || Boolean(conflictingDate)}>
        {status === "submitting" ? "Sending request…" : <>Request these dates <ArrowRight size={17} /></>}
      </button>
      <p className={styles.paymentNote}>No payment is collected on this step. Secure online payment will be added to the final confirmation flow.</p>
    </form>
  );
}
