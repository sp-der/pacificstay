import { NextRequest, NextResponse } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../../../../lib/supabaseConfig";
import { approvedReservationEmail, confirmedReservationEmail } from "../../../../lib/reservationEmails";

type ReservationRow = {
  id: string;
  confirmation_code: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  total_amount: number | null;
  properties: { name: string } | { name: string }[] | null;
};

function propertyName(value: ReservationRow["properties"]) {
  if (Array.isArray(value)) return value[0]?.name ?? "your Pacific Stay property";
  return value?.name ?? "your Pacific Stay property";
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ error: "Administrator sign-in required." }, { status: 401 });

    const body = await request.json() as { reservationId?: string; template?: "approved" | "confirmed" };
    if (!body.reservationId || !body.template) return NextResponse.json({ error: "Reservation and template are required." }, { status: 400 });

    const reservationResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?id=eq.${encodeURIComponent(body.reservationId)}&select=id,confirmation_code,check_in,check_out,guests,guest_name,guest_email,total_amount,properties(name)&limit=1`,
      { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: authorization } },
    );
    if (!reservationResponse.ok) return NextResponse.json({ error: "Reservation could not be loaded." }, { status: 403 });
    const [reservation] = await reservationResponse.json() as ReservationRow[];
    if (!reservation) return NextResponse.json({ error: "Reservation not found." }, { status: 404 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pacificstay.vercel.app";
    const input = {
      guestName: reservation.guest_name,
      propertyName: propertyName(reservation.properties),
      confirmationCode: reservation.confirmation_code,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      guests: reservation.guests,
      totalAmount: reservation.total_amount,
      portalUrl: `${siteUrl}/reservation/${reservation.id}`,
    };
    const email = body.template === "confirmed" ? confirmedReservationEmail(input) : approvedReservationEmail(input);

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json({ error: "Resend is not connected yet.", preview: { subject: email.subject } }, { status: 503 });
    }

    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: reservation.guest_email,
        subject: email.subject,
        html: email.html,
      }),
    });

    const sendResult = await sendResponse.json().catch(() => ({}));
    if (!sendResponse.ok) return NextResponse.json({ error: "Reservation email could not be sent.", details: sendResult }, { status: 502 });

    return NextResponse.json({ ok: true, id: (sendResult as { id?: string }).id ?? null });
  } catch {
    return NextResponse.json({ error: "Reservation email could not be sent." }, { status: 500 });
  }
}
