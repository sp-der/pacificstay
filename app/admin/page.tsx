"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, CheckCircle2, Copy, CreditCard, ExternalLink, LogOut, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseHeaders } from "../../lib/supabaseConfig";
import PropertyEditor from "./PropertyEditor";
import styles from "./admin.module.css";

type Session = { access_token: string; refresh_token?: string; user: { email?: string; app_metadata?: { role?: string } } };
type BookingRequest = {
  id: string; request_number: number; property_name: string; check_in: string; check_out: string;
  guests: number; full_name: string; email: string; phone: string; message: string | null;
  status: "new" | "contacted" | "approved" | "declined" | "cancelled"; created_at: string;
};
type Property = { id: string; name: string; slug: string; min_nights: number; max_guests: number };
type CalendarBlock = { id: number; property_id: string; stay_date: string; source: string };
type NightlyRate = { id: number; property_id: string; stay_date: string; nightly_rate: number };
type Reservation = {
  id: string; confirmation_code: string; property_id: string; booking_request_id: string | null;
  check_in: string; check_out: string; guests: number; guest_name: string; guest_email: string; guest_phone: string | null;
  status: "hold" | "confirmed" | "cancelled" | "completed"; source: string;
  subtotal: number | null; cleaning_fee: number | null; tax_amount: number | null; total_amount: number | null;
  payment_status: "not_required" | "pending" | "paid" | "refunded" | "failed"; created_at: string;
  properties: { name: string } | { name: string }[] | null;
};

const SESSION_KEY = "pacific-stay-admin-session";
const requestSelect = "id,request_number,property_name,check_in,check_out,guests,full_name,email,phone,message,status,created_at";
const reservationSelect = "id,confirmation_code,property_id,booking_request_id,check_in,check_out,guests,guest_name,guest_email,guest_phone,status,source,subtotal,cleaning_fee,tax_amount,total_amount,payment_status,created_at,properties(name)";

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function today() { return new Date().toISOString().slice(0, 10); }
function money(value: number | null) {
  if (value == null) return "Pending quote";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
function propertyName(value: Reservation["properties"]) {
  if (Array.isArray(value)) return value[0]?.name ?? "Pacific Stay property";
  return value?.name ?? "Pacific Stay property";
}

export default function BookingAdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [rates, setRates] = useState<NightlyRate[]>([]);
  const [blockForm, setBlockForm] = useState({ propertyId: "", start: "", end: "", source: "manual" });
  const [rateForm, setRateForm] = useState({ propertyId: "", date: "", rate: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);

  const loadDashboard = useCallback(async (activeSession: Session) => {
    setLoading(true); setError("");
    const headers = supabaseHeaders(activeSession.access_token);
    try {
      const [requestResponse, reservationResponse, propertyResponse, blockResponse, rateResponse] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/booking_requests?select=${requestSelect}&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/reservations?select=${reservationSelect}&source=eq.direct&order=created_at.desc`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/properties?select=id,name,slug,min_nights,max_guests&order=name`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/booking_calendar?select=id,property_id,stay_date,source&stay_date=gte.${today()}&order=stay_date&limit=500`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/nightly_rates?select=id,property_id,stay_date,nightly_rate&stay_date=gte.${today()}&order=stay_date&limit=500`, { headers }),
      ]);
      if ([requestResponse, reservationResponse, propertyResponse, blockResponse, rateResponse].some((response) => !response.ok)) throw new Error("Admin data could not be loaded.");
      const [requestRows, reservationRows, propertyRows, blockRows, rateRows] = await Promise.all([
        requestResponse.json(), reservationResponse.json(), propertyResponse.json(), blockResponse.json(), rateResponse.json(),
      ]);
      setRequests(requestRows); setReservations(reservationRows); setProperties(propertyRows); setBlocks(blockRows); setRates(rateRows);
      if (propertyRows[0]) {
        setBlockForm((current) => ({ ...current, propertyId: current.propertyId || propertyRows[0].id }));
        setRateForm((current) => ({ ...current, propertyId: current.propertyId || propertyRows[0].id }));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled=false;
    async function restore() {
      try {
        const hash=new URLSearchParams(window.location.hash.slice(1));
        const access=hash.get('access_token');
        const saved=window.sessionStorage.getItem(SESSION_KEY);
        const parsed=access?{access_token:access,refresh_token:hash.get('refresh_token')}:saved?JSON.parse(saved):null;
        if(access) window.history.replaceState(null,'','/admin');
        if(!parsed?.access_token)return;
        const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:supabaseHeaders(parsed.access_token)});
        if(!response.ok)throw Error();
        const user=await response.json();
        if(user.app_metadata?.role!=='admin')throw Error();
        if(!cancelled){const verified={access_token:parsed.access_token,refresh_token:parsed.refresh_token,user};setSession(verified);window.sessionStorage.setItem(SESSION_KEY,JSON.stringify(verified));if(hash.get('type')==='recovery'||hash.get('type')==='invite')setRecovery(true);await loadDashboard(verified);}
      }catch{window.sessionStorage.removeItem(SESSION_KEY);if(!cancelled)setSession(null);}
    }
    void restore();return()=>{cancelled=true;};
  }, [loadDashboard]);

  useEffect(() => {
    if(!session?.refresh_token)return;
    const timer=setInterval(async()=>{
      try {
        const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
        if(!r.ok)throw Error(); const next=await r.json() as Session;
        if(next.user.app_metadata?.role!=='admin')throw Error();
        window.sessionStorage.setItem(SESSION_KEY,JSON.stringify(next));setSession(next);
      }catch {window.sessionStorage.removeItem(SESSION_KEY);setSession(null);setError('Your session expired. Please sign in again.');}
    },45*60*1000);return()=>clearInterval(timer);
  },[session?.refresh_token]);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!response.ok) throw new Error("Email or password was not accepted.");
      const nextSession = await response.json() as Session;
      if (nextSession.user.app_metadata?.role !== "admin") throw new Error("This account does not have Pacific Stay administrator access.");
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession); setPassword(""); await loadDashboard(nextSession);
    } catch (signInError) { setError(signInError instanceof Error ? signInError.message : "Sign-in failed."); }
    finally { setLoading(false); }
  }

  async function resetPassword() {
    setError(""); setNotice("");
    if (!email.trim()) { setError("Enter your email first."); return; }
    try {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(window.location.origin + '/admin')}`, {method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email:email.trim().toLowerCase()})});
      if (!r.ok) throw Error();
      setNotice("If your account exists, you will receive a password reset email. Check your inbox and spam folder.");
    } catch { setError("The reset email could not be requested. Please try again."); }
  }
  async function changePassword(event: FormEvent) {
    event.preventDefault(); if (!session) return;
    setLoading(true); setError("");
    try { const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',headers:{...supabaseHeaders(session.access_token),'Content-Type':'application/json'},body:JSON.stringify({password})});
      if(!r.ok)throw Error(); setPassword("");setRecovery(false);setNotice("Password updated.");
    } catch {setError("Password could not be changed. Request a new reset link.");} finally {setLoading(false);}
  }

  function signOut() { if(session) void fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:"POST",headers:supabaseHeaders(session.access_token)}); window.sessionStorage.removeItem(SESSION_KEY); setSession(null); setRequests([]); setReservations([]); setBlocks([]); setRates([]); }

  async function updateRequest(id: string, status: BookingRequest["status"]) {
    if (!session) return;
    setError(""); setNotice("");
    const isReservationAction = status === "approved" || status === "cancelled";
    const response = await fetch(
      isReservationAction
        ? `${SUPABASE_URL}/rest/v1/rpc/${status === "approved" ? "approve_booking_request" : "cancel_booking_request"}`
        : `${SUPABASE_URL}/rest/v1/booking_requests?id=eq.${id}`,
      {
        method: isReservationAction ? "POST" : "PATCH",
        headers: { ...supabaseHeaders(session.access_token), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(isReservationAction ? { p_request_id: id } : { status, updated_at: new Date().toISOString() }),
      },
    );
    if (!response.ok) {
      const details = await response.json().catch(() => null) as { message?: string } | null;
      setError(details?.message ?? "The request status could not be changed."); return;
    }
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
    setNotice(status === "approved"
      ? "Request approved. Dates are blocked and a guest reservation has been created below."
      : status === "cancelled" ? "Request cancelled and direct-booking dates released." : "Request status updated.");
    if (isReservationAction) await loadDashboard(session);
  }

  async function updateReservation(reservation: Reservation, updates: Partial<Pick<Reservation, "status" | "payment_status">>, successMessage: string) {
    if (!session) return;
    setError(""); setNotice("");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservation.id}`, {
      method: "PATCH",
      headers: { ...supabaseHeaders(session.access_token), "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
    });
    if (!response.ok) { const details = await response.json().catch(() => ({})); setError(details.message ?? "Reservation could not be updated."); return; }
    setNotice(successMessage); await loadDashboard(session);
  }

  async function cancelReservation(reservation: Reservation) {
    if (!session || !reservation.booking_request_id) { setError("This reservation is not linked to a booking request."); return; }
    setError(""); setNotice("");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cancel_booking_request`, {
      method: "POST", headers: { ...supabaseHeaders(session.access_token), "Content-Type": "application/json" },
      body: JSON.stringify({ p_request_id: reservation.booking_request_id }),
    });
    if (!response.ok) { const details = await response.json().catch(() => ({})); setError(details.message ?? "Reservation could not be cancelled."); return; }
    setNotice("Reservation cancelled and its direct-booking dates were released."); await loadDashboard(session);
  }

  async function copyGuestLink(reservation: Reservation) {
    const url = `${window.location.origin}/reservation/${reservation.id}`;
    await navigator.clipboard.writeText(url);
    setNotice(`Guest reservation link copied for ${reservation.guest_name}.`); setError("");
  }

  async function sendReservationEmail(reservation: Reservation, template: "approved" | "confirmed") {
    if (!session) return;
    setError(""); setNotice("");
    const response = await fetch("/api/email/reservation", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: reservation.id, template }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      if (response.status === 503) setNotice("Email template is ready. Connect Resend to activate delivery.");
      else setError(result.error ?? "Reservation email could not be sent.");
      return;
    }
    setNotice(template === "approved" ? "Approval email sent to the guest." : "Final confirmation email sent to the guest.");
  }

  async function addBlock(event: FormEvent) {
    event.preventDefault(); if (!session) return;
    setError(""); setNotice("");
    if (!blockForm.start || !blockForm.end || blockForm.end <= blockForm.start) { setError("Choose a valid block start and end date."); return; }
    const rows = [];
    for (let date = blockForm.start; date < blockForm.end; date = addDays(date, 1)) rows.push({ property_id: blockForm.propertyId, stay_date: date, source: blockForm.source });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/booking_calendar?on_conflict=property_id,stay_date`, {
      method: "POST", headers: { ...supabaseHeaders(session.access_token), "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" }, body: JSON.stringify(rows),
    });
    if (!response.ok) { setError("Those dates could not be blocked."); return; }
    setBlockForm((current) => ({ ...current, start: "", end: "" })); setNotice("Calendar dates blocked."); await loadDashboard(session);
  }

  async function saveRate(event: FormEvent) {
    event.preventDefault(); if (!session) return;
    setError(""); setNotice("");
    const nightlyRate = Number(rateForm.rate);
    if (!rateForm.date || !Number.isFinite(nightlyRate) || nightlyRate < 0) { setError("Enter a valid date and nightly rate."); return; }
    const response = await fetch(`${SUPABASE_URL}/rest/v1/nightly_rates?on_conflict=property_id,stay_date`, {
      method: "POST", headers: { ...supabaseHeaders(session.access_token), "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ property_id: rateForm.propertyId, stay_date: rateForm.date, nightly_rate: nightlyRate }),
    });
    if (!response.ok) { setError("The nightly rate could not be saved."); return; }
    setRateForm((current) => ({ ...current, date: "", rate: "" })); setNotice("Nightly rate saved."); await loadDashboard(session);
  }

  async function syncAirbnb() {
    if (!session) return;
    setLoading(true); setError(""); setNotice("");
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-airbnb-calendar`, {
        method: "POST", headers: { ...supabaseHeaders(session.access_token), "Content-Type": "application/json" },
      });
      const result = await response.json() as { error?: string; blocked_nights?: number };
      if (!response.ok) throw new Error(result.error ?? "Airbnb calendar sync failed.");
      setNotice(`Airbnb calendar synchronized. ${result.blocked_nights ?? 0} unavailable nights loaded.`); await loadDashboard(session);
    } catch (syncError) { setError(syncError instanceof Error ? syncError.message : "Airbnb calendar sync failed."); }
    finally { setLoading(false); }
  }

  const statusCounts = useMemo(() => Object.fromEntries(["new", "contacted", "approved", "declined", "cancelled"].map((status) => [status, requests.filter((request) => request.status === status).length])), [requests]);
  const activeReservations = reservations.filter((reservation) => !["cancelled", "completed"].includes(reservation.status));
  const awaitingPayment = activeReservations.filter((reservation) => reservation.payment_status !== "paid").length;

    if (session && recovery) return <main className={styles.loginPage}><form className={styles.loginCard} onSubmit={changePassword}><h1>Choose your password</h1><label>New password<input type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p role="alert">{error}</p>}<button disabled={loading}>Save password</button></form></main>;
  if (!session) return <main className={styles.loginPage}>
    <form className={styles.loginCard} onSubmit={signIn}>
      <div className={styles.brand}>PACIFIC STAY <small>OWNER DASHBOARD</small></div><ShieldCheck size={30} />
      <h1>Owner sign in</h1><p>Manage your properties and guest reservations with your approved account.</p>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required /></label>
      {notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}
      <button disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
      <button type="button" className={styles.secondaryButton} onClick={resetPassword}>Forgot password?</button>
    </form></main>;

  return <main className={styles.adminPage}>
    <header className={styles.header}>
      <div><span>PACIFIC STAY</span><small>Properties & bookings</small></div>
      <div className={styles.headerActions}><span>{session.user.email}</span><button onClick={() => loadDashboard(session)} disabled={loading}><RefreshCw size={15} /> Refresh</button><button onClick={signOut}><LogOut size={15} /> Sign out</button></div>
    </header>
    <div className={styles.shell}>
      <section className={styles.heading}><div><p>Private workspace</p><h1>Owner dashboard</h1></div><span><ShieldCheck size={16} /> Private owner access</span></section>
      {notice && <div className={styles.notice}><Check size={16} /> {notice}</div>}{error && <div className={styles.error} role="alert">{error}</div>}
      <section className={styles.panel}><details><summary>Dashboard help</summary><p>Open a section in Your property, edit the details, then select Save changes. View public listing opens the updated page. Rates apply to new approvals; existing reservation totals stay unchanged.</p><p>Upload JPG, PNG, or WebP photos under 10 MB, select the cover and preview images, and save to publish. Update your house rules when changing occupancy or booking limits.</p><p>Your Stripe account remains yours. Your website manager will provide the separate activation instructions. Never enter payment keys or door codes in listing content. Stripe payments confirm automatically; cancelling a reservation does not refund a payment.</p></details></section>
      <PropertyEditor token={session.access_token} />
      <section className={styles.stats}>
        <article><small>New requests</small><strong>{statusCounts.new ?? 0}</strong></article>
        <article><small>Active reservations</small><strong>{activeReservations.length}</strong></article>
        <article><small>Awaiting payment</small><strong>{awaitingPayment}</strong></article>
        <article><small>Blocked nights</small><strong>{blocks.length}</strong></article>
      </section>

      <section className={styles.reservationPanel}>
        <div className={styles.panelTitle}><div><p>Post-approval</p><h2>Reservations</h2></div><span>{reservations.length} total</span></div>
        <div className={styles.reservationList}>{reservations.length === 0 ? <div className={styles.empty}>Approved stays will appear here.</div> : reservations.map((reservation) => {
          const paid = reservation.payment_status === "paid";
          return <article className={styles.reservationCard} key={reservation.id}>
            <div className={styles.reservationTop}>
              <div><small>{reservation.confirmation_code}</small><h3>{reservation.guest_name}</h3><p>{propertyName(reservation.properties)}</p></div>
              <div className={styles.reservationChips}><span className={styles[reservation.status]}>{reservation.status === "hold" ? "approved" : reservation.status}</span><span className={paid ? styles.paidChip : styles.pendingChip}>{paid ? "paid" : "awaiting payment"}</span></div>
            </div>
            <div className={styles.reservationMeta}><span><CalendarDays size={15} /> {reservation.check_in} → {reservation.check_out}</span><span>{reservation.guests} guests</span><span>{money(reservation.total_amount)}</span></div>
            <div className={styles.reservationLinks}><button onClick={() => copyGuestLink(reservation)}><Copy size={14} /> Copy guest link</button><a href={`/reservation/${reservation.id}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open portal</a><a href={`mailto:${reservation.guest_email}`}><Mail size={14} /> Email guest</a></div>
            <div className={styles.reservationActions}>
              {!paid && reservation.status !== "cancelled" && <button className={styles.primarySmall} onClick={() => updateReservation(reservation, { payment_status: "paid", status: "confirmed" }, "Payment marked paid and reservation confirmed.")}><CreditCard size={14} /> Mark paid & confirm</button>}
              {paid && reservation.status === "confirmed" && <button onClick={() => updateReservation(reservation, { status: "completed" }, "Reservation marked completed.")}><CheckCircle2 size={14} /> Complete stay</button>}
              {reservation.status !== "cancelled" && <button onClick={() => sendReservationEmail(reservation, paid ? "confirmed" : "approved")}><Mail size={14} /> {paid ? "Send confirmation email" : "Send approval email"}</button>}
              {reservation.status !== "cancelled" && reservation.status !== "completed" && <button className={styles.dangerButton} onClick={() => cancelReservation(reservation)}>Cancel reservation</button>}
            </div>
          </article>;
        })}</div>
      </section>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}><div><p>Guest pipeline</p><h2>Booking requests</h2></div><span>{requests.length} total</span></div>
          <div className={styles.requestList}>{requests.length === 0 ? <div className={styles.empty}>No booking requests yet.</div> : requests.map((request) => <article className={styles.requestCard} key={request.id}>
            <div className={styles.requestTop}><div><small>Request #{String(request.request_number).padStart(3, "0")}</small><h3>{request.full_name}</h3></div><span className={styles[request.status]}>{request.status}</span></div>
            <div className={styles.dates}><CalendarDays size={16} /><strong>{request.check_in}</strong><span>to</span><strong>{request.check_out}</strong><span>· {request.guests} guests</span></div>
            <div className={styles.contact}><a href={`mailto:${request.email}`}>{request.email}</a><a href={`tel:${request.phone}`}>{request.phone}</a></div>
            {request.message && <p className={styles.message}>{request.message}</p>}
            <div className={styles.statusActions}>{(["new", "contacted", "approved", "declined", "cancelled"] as BookingRequest["status"][]).map((status) => <button key={status} disabled={request.status === status || (request.status === "approved" && status !== "cancelled") || (request.status === "cancelled" && status !== "cancelled")} onClick={() => updateRequest(request.id, status)}>{status}</button>)}</div>
          </article>)}</div>
        </div>
        <aside className={styles.sideColumn}>
          <form className={styles.panel} onSubmit={addBlock}><div className={styles.panelTitle}><div><p>Availability</p><h2>Block dates</h2></div></div>
            <label>Property<select value={blockForm.propertyId} onChange={(event) => setBlockForm({ ...blockForm, propertyId: event.target.value })}>{properties.map((property) => <option value={property.id} key={property.id}>{property.name}</option>)}</select></label>
            <div className={styles.formRow}><label>First blocked night<input type="date" min={today()} value={blockForm.start} onChange={(event) => setBlockForm({ ...blockForm, start: event.target.value })} required /></label><label>Checkout / reopen date<input type="date" min={blockForm.start || today()} value={blockForm.end} onChange={(event) => setBlockForm({ ...blockForm, end: event.target.value })} required /></label></div>
            <label>Reason<select value={blockForm.source} onChange={(event) => setBlockForm({ ...blockForm, source: event.target.value })}><option value="manual">Manual hold</option><option value="maintenance">Maintenance</option></select></label>
            <button className={styles.primaryButton}>Block selected nights</button><button className={styles.secondaryButton} type="button" onClick={syncAirbnb} disabled={loading}>Sync Airbnb calendar</button>
            <small className={styles.helper}>Calendar synchronization is managed by your website manager.</small>
          </form>
          <form className={styles.panel} onSubmit={saveRate}><div className={styles.panelTitle}><div><p>Pricing</p><h2>Nightly override</h2></div></div>
            <label>Property<select value={rateForm.propertyId} onChange={(event) => setRateForm({ ...rateForm, propertyId: event.target.value })}>{properties.map((property) => <option value={property.id} key={property.id}>{property.name}</option>)}</select></label>
            <div className={styles.formRow}><label>Date<input type="date" min={today()} value={rateForm.date} onChange={(event) => setRateForm({ ...rateForm, date: event.target.value })} required /></label><label>Nightly rate<input type="number" min="0" step="0.01" placeholder="Nightly rate" value={rateForm.rate} onChange={(event) => setRateForm({ ...rateForm, rate: event.target.value })} required /></label></div>
            <button className={styles.primaryButton}>Save nightly rate</button>
          </form>
        </aside>
      </section>
    </div>
  </main>;
}
