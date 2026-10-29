import "server-only";
import { SUPABASE_URL, supabaseHeaders } from "../supabaseConfig";

export const CASA_DEL_CACTUS_SLUG = "casa-del-cactus";

type CasaDirectRow = {
  id: string;
  active: boolean;
  base_nightly_rate: number | null;
  min_nights: number;
  max_nights: number;
  content: {
    directBookingEnabled?: boolean;
  } | null;
};

export type CasaBookingReadiness =
  | { ready: true; reason: "ready" }
  | { ready: false; reason: "not-imported" | "not-configured" | "service-unavailable" };

/**
 * A published property page is not proof that the direct booking engine has
 * rates, a connected calendar, or owner permission to accept requests.
 * Casa stays on Airbnb until a live managed record, a positive rate, valid
 * night limits, and the owner's booking-readiness approval all exist.
 */
export async function getCasaBookingReadiness(): Promise<CasaBookingReadiness> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?slug=eq.${CASA_DEL_CACTUS_SLUG}&active=eq.true&select=id,active,base_nightly_rate,min_nights,max_nights,content&limit=1`,
      { headers: supabaseHeaders(), cache: "no-store" },
    );
    if (!response.ok) return { ready: false, reason: "service-unavailable" };
    const [property] = (await response.json()) as CasaDirectRow[];
    if (!property) return { ready: false, reason: "not-imported" };
    const validRate = Number.isFinite(Number(property.base_nightly_rate)) && Number(property.base_nightly_rate) > 0;
    const validStayLimits = property.min_nights >= 1 && property.max_nights >= property.min_nights;
    if (!validRate || !validStayLimits || property.content?.directBookingEnabled !== true) {
      return { ready: false, reason: "not-configured" };
    }
    return { ready: true, reason: "ready" };
  } catch {
    return { ready: false, reason: "service-unavailable" };
  }
}
