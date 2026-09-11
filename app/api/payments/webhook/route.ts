import { NextRequest, NextResponse } from 'next/server';
import { confirmCheckout, paymentDb, paymentsConfigured, stripeClient } from '../../../../lib/server/payments';
import type Stripe from 'stripe';
export const runtime='nodejs';
export async function POST(request:NextRequest) {
 if (!paymentsConfigured()) return NextResponse.json({error:'Payments unavailable'},{status:503});
 let event:Stripe.Event;
 try { event=stripeClient().webhooks.constructEvent(await request.text(),request.headers.get('stripe-signature')??'',process.env.STRIPE_WEBHOOK_SECRET!); }
 catch { return NextResponse.json({error:'Invalid signature'},{status:400}); }
 try {
  if(event.type==='checkout.session.completed' || event.type==='checkout.session.async_payment_succeeded') await confirmCheckout(event.data.object);
  if(event.type==='checkout.session.expired' || event.type==='checkout.session.async_payment_failed') {
   const session=event.data.object;
   if(session.metadata?.reservation_id && session.metadata?.attempt_id) {
    await paymentDb(`reservation_payments?reservation_id=eq.${encodeURIComponent(session.metadata.reservation_id)}&attempt_id=eq.${encodeURIComponent(session.metadata.attempt_id)}&status=eq.pending`,{status:event.type==='checkout.session.expired'?'expired':'failed'},'PATCH');
   }
  }
  return NextResponse.json({received:true});
 } catch { console.error('Stripe payment confirmation requires retry',event.id); return NextResponse.json({error:'Confirmation pending; retry required'},{status:500}); }
}
