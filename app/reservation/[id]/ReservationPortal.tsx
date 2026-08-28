"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Home, Mail, MapPin, ShieldCheck, Users } from "lucide-react";
import { SUPABASE_URL, supabaseHeaders } from "../../../lib/supabaseConfig";
import styles from "./reservation.module.css";

type Reservation = {
  reservation_id: string;
  confirmation_code: string;
  property_name: string;
  property_slug: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  reservation_status: "hold" | "confirmed" | "cancelled" | "completed";
  payment_status: "not_required" | "pending" | "paid" | "refunded" | "failed";
  subtotal: number | null;
  cleaning_fee: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  created_at: string;
};

type IntegrationStatus = { helcim: boolean; resend: boolean };

function money(value: number | null) {
  if (value == null) return "Pending";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T12:00:00`).getTime();
  const end = new Date(`${checkOut}T12:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export default function ReservationPortal({ reservationId }: { reservationId: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus>({ helcim: false, resend: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [reservationResponse, integrationResponse] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/rpc/get_guest_reservation`, {
            method: "POST",
            headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ p_reservation_id: reservationId }),
          }),
          fetch("/api/integrations/status", { cache: "no-store" }),
        ]);

        if (!reservationResponse.ok) {
          throw new Error("This reservation portal is not available yet. If your stay was just approved, please try again shortly.");
        }
        const rows = await reservationResponse.json() as Reservation[];
        if (!rows[0]) throw new Error("We could not find this reservation.");
        if (!cancelled) {
          setReservation(rows[0]);
          if (integrationResponse.ok) setIntegrations(await integrationResponse.json() as IntegrationStatus);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Reservation could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reservationId]);

  const nights = useMemo(() => reservation ? nightsBetween(reservation.check_in, reservation.check_out) : 0, [reservation]);

  if (loading) return <main className={styles.page}><div className={styles.loadingCard}><span>Pacific Stay Properties</span><p>Loading your reservation…</p></div></main>;
  if (error || !reservation) return <main className={styles.page}><div className={styles.errorCard}><span>Pacific Stay Properties</span><h1>Reservation link unavailable</h1><p>{error}</p><a href="mailto:info@pacificstayproperties.com">Contact Pacific Stay</a></div></main>;

  const isCancelled = reservation.reservation_status === "cancelled";
  const isPaid = reservation.payment_status === "paid";
  const isConfirmed = reservation.reservation_status === "confirmed" && isPaid;
  const statusTitle = isCancelled ? "Reservation cancelled" : isConfirmed ? "You’re confirmed" : "Your dates are approved";
  const statusCopy = isCancelled
    ? "This reservation is no longer active. Contact Pacific Stay if you have questions."
    : isConfirmed
      ? "Payment is complete and your Pacific Stay reservation is confirmed."
      : "Your dates are being held for you. Complete payment when secure checkout is available to finalize the reservation.";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><span>PACIFIC STAY</span><small>PROPERTIES</small></Link>
        <a href="mailto:info@pacificstayproperties.com"><Mail size={15} /> Need help?</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <img src={reservation.property_slug === "chestnut-by-the-sea" ? "/chestnut/Exterior1.webp" : "/PSP.png"} alt={`${reservation.property_name} exterior`} />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Direct reservation</p>
          <div className={styles.statusLine}><ShieldCheck size={18} /><span>{statusTitle}</span></div>
          <h1>{reservation.property_name}</h1>
          <p>{statusCopy}</p>
          <div className={styles.confirmation}><small>Confirmation</small><strong>{reservation.confirmation_code}</strong></div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeading}><div><p className={styles.eyebrow}>Stay details</p><h2>Everything in one place.</h2></div><Home size={22} /></div>
            <div className={styles.detailGrid}>
              <div><CalendarDays size={18} /><span>Check-in<strong>{formatDate(reservation.check_in)}</strong></span></div>
              <div><CalendarDays size={18} /><span>Check-out<strong>{formatDate(reservation.check_out)}</strong></span></div>
              <div><Clock3 size={18} /><span>Length<strong>{nights} night{nights === 1 ? "" : "s"}</strong></span></div>
              <div><Users size={18} /><span>Guests<strong>{reservation.guests}</strong></span></div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeading}><div><p className={styles.eyebrow}>Price details</p><h2>Your direct-booking total.</h2></div><CircleDollarSign size={22} /></div>
            <div className={styles.priceRows}>
              <div><span>Stay subtotal</span><strong>{money(reservation.subtotal)}</strong></div>
              <div><span>Cleaning fee</span><strong>{money(reservation.cleaning_fee)}</strong></div>
              <div><span>Carlsbad lodging taxes & assessment</span><strong>{money(reservation.tax_amount)}</strong></div>
              <div className={styles.totalRow}><span>Total</span><strong>{money(reservation.total_amount)}</strong></div>
            </div>
          </section>

          <section className={styles.supportCard}>
            <MapPin size={19} />
            <div><strong>Local support from Pacific Stay</strong><p>Questions about arrival, the home, or your reservation? Jami and Pacific Stay are available to help.</p></div>
            <a href="mailto:info@pacificstayproperties.com">Email Pacific Stay</a>
          </section>
        </div>

        <aside className={styles.checkoutCard}>
          <p className={styles.eyebrow}>Reservation status</p>
          <h2>{isCancelled ? "Cancelled" : isPaid ? "Paid" : "Awaiting payment"}</h2>
          <div className={styles.timeline}>
            <div className={styles.done}><CheckCircle2 size={18} /><span><strong>Stay approved</strong><small>Dates are held in the Pacific Stay calendar.</small></span></div>
            <div className={isPaid ? styles.done : styles.current}><CircleDollarSign size={18} /><span><strong>Payment</strong><small>{isPaid ? "Payment received." : "Secure checkout is the next step."}</small></span></div>
            <div className={isConfirmed ? styles.done : styles.future}><ShieldCheck size={18} /><span><strong>Final confirmation</strong><small>{isConfirmed ? "Reservation fully confirmed." : "Completes after payment."}</small></span></div>
          </div>

          {!isCancelled && !isPaid && (
            <>
              {integrations.helcim ? (
                <Link className={styles.payButton} href={`/reservation/${reservation.reservation_id}/checkout`}>Continue to secure checkout</Link>
              ) : (
                <button className={styles.payButton} disabled>Secure checkout coming online</button>
              )}
              <p className={styles.providerNote}>Payments will be processed securely through Helcim. No card information is stored by Pacific Stay.</p>
            </>
          )}

          {isConfirmed && <div className={styles.confirmedBox}><CheckCircle2 size={20} /><span><strong>All set</strong><small>Your reservation is paid and confirmed.</small></span></div>}
          <div className={styles.contactStrip}><span>Questions?</span><a href="tel:7604296633">760-429-6633</a></div>
        </aside>
      </section>
    </main>
  );
}
