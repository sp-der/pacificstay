import 'server-only';
import { getProperty } from '../../app/properties/propertyData';
import { ManagedProperty, mergeProperty, propertySelect } from '../propertyContent';
import { SUPABASE_URL, supabaseHeaders } from '../supabaseConfig';
export async function getManagedProperty(slug: string) {
  const base = getProperty(slug);
  if (!base) return undefined;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=${propertySelect}`, { headers: supabaseHeaders(), cache: 'no-store' });
  if (!response.ok) throw new Error('Property information is temporarily unavailable.');
  const [row] = await response.json() as ManagedProperty[];
  return row ? mergeProperty(base, row) : undefined;
}
