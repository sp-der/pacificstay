import { paymentsConfigured } from "../../../../lib/server/payments";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    stripe: paymentsConfigured(),
    resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
  });
}
