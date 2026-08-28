import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    helcim: Boolean(process.env.HELCIM_API_TOKEN && process.env.HELCIM_ACCOUNT_ID),
    resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
  });
}
