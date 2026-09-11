import { NextRequest, NextResponse } from 'next/server';
import { confirmCheckout, paymentDb, paymentsConfigured, stripeClient } from '../../../../lib/server/payments';
export const runtime='nodejs';
export async function POST(request:NextRequest) {
 if (!paymentsConfigured()) return NextResponse.json({error:'Card payments are not yet available. Please contact Pacific Stay.'},{status:503});
 const origin=new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;
 if (request.headers.get('origin')!==origin) return NextResponse.json({error:'Invalid request origin.'},{status:403});
 let reservationId: string;
 try { ({reservationId}=await request.json()); if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reservationId)) throw Error(); }
 catch { return NextResponse.json({error:'A valid reservation link is required.'},{status:400}); }
 try {
  const stripe=stripeClient();
  const attempt=await paymentDb('rpc/prepare_reservation_payment',{p_reservation_id:reservationId});
  // Stable attempt ID and expiration make simultaneous clicks and network retries idempotent.
  const existing=attempt.session_id?await stripe.checkout.sessions.retrieve(attempt.session_id):null;
  if(existing?.status==='complete') { await confirmCheckout(existing); return NextResponse.json({url:`${origin}/reservation/${reservationId}?payment=success`}); }
  if(existing?.status==='expired') {
    await paymentDb(`reservation_payments?reservation_id=eq.${reservationId}&attempt_id=eq.${attempt.attempt_id}&status=eq.pending`,{status:'expired'},'PATCH');
    return NextResponse.json({error:'Your checkout expired. Select Pay with Stripe again to start a new checkout.'},{status:409});
  }
  if(existing?.url) return NextResponse.json({url:existing.url});
  const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],client_reference_id:reservationId,
    customer_email:attempt.guest_email,metadata:{reservation_id:reservationId,attempt_id:attempt.attempt_id},
    payment_intent_data:{metadata:{reservation_id:reservationId,attempt_id:attempt.attempt_id}},
    line_items:[{quantity:1,price_data:{currency:'usd',unit_amount:Number(attempt.amount_cents),product_data:{name:`${attempt.property_name} — ${attempt.confirmation_code}`}}}],
    expires_at:Math.floor(new Date(attempt.expires_at).getTime()/1000),
    success_url:`${origin}/reservation/${reservationId}?payment=success`,cancel_url:`${origin}/reservation/${reservationId}/checkout?payment=cancelled`
  },{idempotencyKey:`reservation-${attempt.attempt_id}`});
  await paymentDb(`reservation_payments?reservation_id=eq.${reservationId}&attempt_id=eq.${attempt.attempt_id}`,{session_id:session.id},'PATCH');
  return NextResponse.json({url:session.url});
 } catch { return NextResponse.json({error:'Checkout could not be opened. Your reservation may no longer be payable. Please try again or contact Pacific Stay.'},{status:409}); }
}
