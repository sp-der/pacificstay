import 'server-only';
import { getProperty } from '../../app/properties/propertyData';
import { getPhotoTour } from '../../app/properties/photoTourData';
import { ManagedProperty, mergeProperty, propertySelect } from '../propertyContent';
import { SUPABASE_URL, supabaseHeaders } from '../supabaseConfig';

const NEW_STAY_SLUG = 'casa-del-cactus';
const NEW_STAY_AIRBNB_ID = '1798660872755121079';

/**
 * New public listing fallback until the owner imports it into Pacific Stay's
 * Supabase property editor. Existing active database records take precedence.
 */
function newStayFallback(slug: string) {
  if (slug !== NEW_STAY_SLUG) return undefined;
  const property = getProperty(slug);
  return property ? { ...property, photoTour: getPhotoTour(slug) ?? [] } : undefined;
}

export async function getManagedProperty(slug: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=${propertySelect}&limit=1`, { headers: supabaseHeaders(), cache: 'no-store' });
  if (!response.ok) throw new Error('Property information is temporarily unavailable.');
  const [row] = await response.json() as ManagedProperty[];
  return row ? mergeProperty(getProperty(slug), row) : newStayFallback(slug);
}

export async function listManagedProperties() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?active=eq.true&select=${propertySelect}&order=name`, { headers: supabaseHeaders(), cache: 'no-store' });
  if (!response.ok) throw new Error('Property information is temporarily unavailable.');
  const rows = await response.json() as ManagedProperty[];
  const stays = rows.map(row => mergeProperty(getProperty(row.slug), row));
  const alreadyListed = stays.some(stay =>
    stay.slug === NEW_STAY_SLUG || stay.airbnbUrl?.includes(NEW_STAY_AIRBNB_ID)
  );
  if (!alreadyListed) {
    const newStay = newStayFallback(NEW_STAY_SLUG);
    if (newStay) stays.push(newStay);
  }
  return stays.sort((a, b) => a.name.localeCompare(b.name));
}
