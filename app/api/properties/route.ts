import { NextResponse } from 'next/server';
import { properties } from '../../properties/propertyData';
import { getManagedProperty } from '../../../lib/server/properties';
export async function GET() {
  try { return NextResponse.json((await Promise.all(properties.map(p => getManagedProperty(p.slug)))).filter(Boolean), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Property information is temporarily unavailable.' }, { status: 503 }); }
}
