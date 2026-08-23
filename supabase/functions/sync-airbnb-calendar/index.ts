import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function dateFromIcal(value: string) {
  const match = value.match(/(\d{4})(\d{2})(\d{2})/);
  if (!match) throw new Error("Unsupported iCal date");
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function addDay(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function parseCalendar(ical: string) {
  const unfolded = ical.replace(/\r?\n[ \t]/g, "");
  const events = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const dates = new Map<string, string>();

  for (const event of events) {
    const startValue = event.match(/^DTSTART(?:;[^:]*)?:(.+)$/m)?.[1]?.trim();
    const endValue = event.match(/^DTEND(?:;[^:]*)?:(.+)$/m)?.[1]?.trim();
    const uid = event.match(/^UID:(.+)$/m)?.[1]?.trim() ?? crypto.randomUUID();
    if (!startValue || !endValue) continue;
    const start = dateFromIcal(startValue);
    const end = dateFromIcal(endValue);
    for (let date = start; date < end; date = addDay(date)) dates.set(date, uid);
  }

  return Array.from(dates, ([stay_date, external_uid]) => ({ stay_date, external_uid }));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const icalUrl = Deno.env.get("PACIFIC_STAY_AIRBNB_ICAL_URL");
    const authorization = request.headers.get("Authorization");
    if (!supabaseUrl || !publishableKey || !serviceKey) throw new Error("Supabase function environment is incomplete");
    if (!authorization) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(supabaseUrl, publishableKey, { global: { headers: { Authorization: authorization } } });
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || user?.app_metadata?.role !== "admin") return new Response(JSON.stringify({ error: "Administrator access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!icalUrl) return new Response(JSON.stringify({ error: "Airbnb calendar is not connected yet" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const calendarResponse = await fetch(icalUrl, { headers: { "User-Agent": "PacificStayCalendarSync/1.0" } });
    if (!calendarResponse.ok) throw new Error(`Airbnb calendar returned HTTP ${calendarResponse.status}`);
    const entries = parseCalendar(await calendarResponse.text());
    const serviceClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: properties, error: propertyError } = await serviceClient.from("properties").select("id").eq("slug", "chestnut-by-the-sea").limit(1);
    if (propertyError || !properties?.[0]) throw new Error("Pacific Stay property configuration was not found");
    const { data: inserted, error: replaceError } = await serviceClient.rpc("replace_airbnb_calendar", { p_property_id: properties[0].id, p_entries: entries });
    if (replaceError) throw replaceError;

    return new Response(JSON.stringify({ ok: true, blocked_nights: inserted, events_parsed: entries.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Calendar sync failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
