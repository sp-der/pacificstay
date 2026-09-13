import { NextResponse } from 'next/server';
import { listManagedProperties } from '../../../lib/server/properties';
export async function GET() {
  try { return NextResponse.json(await listManagedProperties(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Property information is temporarily unavailable.' }, { status: 503 }); }
}
