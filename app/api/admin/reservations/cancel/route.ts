import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseHeaders } from '../../../../../lib/supabaseConfig';
import { stripeClient } from '../../../../../lib/server/payments';

type CancellationState = {
  reservation_id: string;
  status: string;
  payment_status: string;
  booking_request_id: string | null;
  payment_attempt_status: string | null;
  stripe_session_id: string | null;
};

async function rpc<T>(name:string, token:string, body:unknown) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    cache: 'no-store',
    headers: { ...supabaseHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message ?? 'Reservation cancellation failed.');
  return result as T;
}

export async function POST(request:NextRequest) {
  try {
    const authorization=request.headers.get('authorization');
    if(!authorization?.startsWith('Bearer ')) return NextResponse.json({error:'Administrator sign-in required.'},{status:401});
    const token=authorization.slice(7);
    const userResponse=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:authorization},cache:'no-store'});
    if(!userResponse.ok) return NextResponse.json({error:'Administrator session expired.'},{status:401});
    const user=await userResponse.json();
    if(user.app_metadata?.role!=='admin') return NextResponse.json({error:'Administrator access required.'},{status:403});

    const body=await request.json() as {reservationId?:string};
    if(!body.reservationId||!/^[0-9a-f-]{36}$/i.test(body.reservationId)) return NextResponse.json({error:'A valid reservation is required.'},{status:400});

    const state=await rpc<CancellationState>('get_reservation_cancellation_state',token,{p_reservation_id:body.reservationId});
    if(state.status==='completed') return NextResponse.json({error:'Completed stays cannot be cancelled from the dashboard.'},{status:409});
    if(state.status==='cancelled') return NextResponse.json({ok:true,refundRequired:state.payment_status==='paid'});

    if(state.payment_attempt_status==='pending'&&state.stripe_session_id){
      if(!process.env.STRIPE_SECRET_KEY) return NextResponse.json({error:'A Stripe checkout is still open. Stripe must be connected before this reservation can be safely cancelled.'},{status:503});
      const stripe=stripeClient();
      const session=await stripe.checkout.sessions.retrieve(state.stripe_session_id);
      if(session.status==='complete'&&session.payment_status==='paid') return NextResponse.json({error:'This checkout just completed. Refresh the dashboard before cancelling so the payment can be reconciled first.'},{status:409});
      if(session.status==='open') await stripe.checkout.sessions.expire(session.id);
    }

    await rpc<boolean>('cancel_reservation',token,{p_reservation_id:body.reservationId});
    return NextResponse.json({ok:true,refundRequired:state.payment_status==='paid'});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:'Reservation cancellation failed.'},{status:409});
  }
}
