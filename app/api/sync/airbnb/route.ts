import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jujenvaofyrwbyunqtya.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AIRBNB_ICAL_URL = process.env.AIRBNB_ICAL_URL;
const CRON_SECRET = process.env.CRON_SECRET;

function unfoldIcal(text: string) {
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function extractValue(block: string, key: string) {
  const line = block.split(/\r?\n/).find((value) => value.startsWith(`${key}:`) || value.startsWith(`${key};`));
  if (!line) return null;
  return line.slice(line.indexOf(":") + 1).trim();
}

function normalizeDate(value: string | null) {
  if (!value) return null;
  const compact = value.slice(0, 8);
  if (!/^\d{8}$/.test(compact)) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function parseBlockedDates(ical: string) {
  const unfolded = unfoldIcal(ical);
  const events = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const entries: { stay_date: string; external_uid: string }[] = [];

  for (const event of events) {
    const start = normalizeDate(extractValue(event, "DTSTART"));
    const end = normalizeDate(extractValue(event, "DTEND"));
    const uid = extractValue(event, "UID") ?? `airbnb-${start ?? "unknown"}`;
    if (!start || !end || end <= start) continue;

    for (let date = start; date < end; date = addDays(date, 1)) {
      entries.push({ stay_date: date, external_uid: uid });
    }
  }

  return { eventsSeen: events.length, entries };
}

function authorized(request: NextRequest) {
  if (!CRON_SECRET) return false;
  return request.headers.get("authorization") === `Bearer ${CRON_SECRET}`;
}

async function runSync(request: NextRequest) {
  if (!SERVICE_ROLE_KEY || !AIRBNB_ICAL_URL || !CRON_SECRET) {
    return NextResponse.json({ error: "Calendar sync environment variables are not configured." }, { status: 503 });
  }
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const propertyResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/properties?slug=eq.chestnut-by-the-sea&select=id&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }, cache: "no-store" },
  );
  if (!propertyResponse.ok) return NextResponse.json({ error: "Property lookup failed." }, { status: 502 });
  const [property] = await propertyResponse.json() as { id: string }[];
  if (!property) return NextResponse.json({ error: "Chestnut property was not found." }, { status: 404 });

  const calendarResponse = await fetch(AIRBNB_ICAL_URL, { cache: "no-store" });
  if (!calendarResponse.ok) return NextResponse.json({ error: "Airbnb calendar fetch failed." }, { status: 502 });
  const calendarText = await calendarResponse.text();
  const parsed = parseBlockedDates(calendarText);

  const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/replace_airbnb_calendar`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_property_id: property.id, p_entries: parsed.entries }),
  });
  if (!rpcResponse.ok) {
    const detail = await rpcResponse.text();
    return NextResponse.json({ error: "Supabase calendar replacement failed.", detail }, { status: 502 });
  }

  const datesAdded = await rpcResponse.json();
  return NextResponse.json({ ok: true, eventsSeen: parsed.eventsSeen, blockedDates: parsed.entries.length, datesAdded });
}

export async function GET(request: NextRequest) {
  return runSync(request);
}

export async function POST(request: NextRequest) {
  return runSync(request);
}
