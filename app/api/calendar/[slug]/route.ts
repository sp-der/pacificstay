import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jujenvaofyrwbyunqtya.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function icsDate(value: string) {
  return value.replaceAll("-", "");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SERVICE_ROLE_KEY) return NextResponse.json({ error: "Calendar export is not configured." }, { status: 503 });

  const headers = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` };
  const propertyResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=id,name&limit=1`,
    { headers, cache: "no-store" },
  );
  if (!propertyResponse.ok) return NextResponse.json({ error: "Property lookup failed." }, { status: 502 });
  const [property] = await propertyResponse.json() as { id: string; name: string }[];
  if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });

  const reservationResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/reservations?property_id=eq.${property.id}&source=eq.direct&status=eq.confirmed&check_out=gte.${new Date().toISOString().slice(0, 10)}&select=id,confirmation_code,check_in,check_out&order=check_in`,
    { headers, cache: "no-store" },
  );
  if (!reservationResponse.ok) return NextResponse.json({ error: "Reservation lookup failed." }, { status: 502 });
  const reservations = await reservationResponse.json() as { id: string; confirmation_code: string; check_in: string; check_out: string }[];

  const events = reservations.map((reservation) => [
    "BEGIN:VEVENT",
    `UID:direct-${reservation.id}@pacificstayproperties.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART;VALUE=DATE:${icsDate(reservation.check_in)}`,
    `DTEND;VALUE=DATE:${icsDate(reservation.check_out)}`,
    `SUMMARY:${escapeIcs("Reserved - Pacific Stay direct booking")}`,
    `DESCRIPTION:${escapeIcs(`Pacific Stay reservation ${reservation.confirmation_code}`)}`,
    "END:VEVENT",
  ].join("\r\n")).join("\r\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pacific Stay Properties//Direct Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(`${property.name} - Pacific Stay`)}`,
    events,
    "END:VCALENDAR",
    "",
  ].filter(Boolean).join("\r\n");

  return new NextResponse(calendar, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename=\"${slug}.ics\"`,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
    },
  });
}
