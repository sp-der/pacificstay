import 'server-only';
import { getProperty } from '../../app/properties/propertyData';
import { ManagedProperty, mergeProperty, propertySelect } from '../propertyContent';
import { SUPABASE_URL, supabaseHeaders } from '../supabaseConfig';

export async function getManagedProperty(slug: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=${propertySelect}&limit=1`, { headers: supabaseHeaders(), cache: 'no-store' });
  if (!response.ok) throw new Error('Property information is temporarily unavailable.');
  const [row] = await response.json() as ManagedProperty[];
  return row ? mergeProperty(getProperty(slug), row) : undefined;
}

export async function listManagedProperties() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/properties?active=eq.true&select=${propertySelect}&order=name`, { headers: supabaseHeaders(), cache: 'no-store' });
  if (!response.ok) throw new Error('Property information is temporarily unavailable.');
  const rows = await response.json() as ManagedProperty[];
  return rows.map(row => mergeProperty(getProperty(row.slug), row));
}
