import 'server-only';
import Stripe from 'stripe';
import { SUPABASE_URL } from '../supabaseConfig';
export function paymentsConfigured() {
 return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SITE_URL);
}
export function stripeClient() {
 if (!process.env.STRIPE_SECRET_KEY) throw new Error('Payments are not configured');
 return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export async function paymentDb(path: string, body?: unknown, method = 'POST') {
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if (!key) throw new Error('Payments are not configured');
 const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {method,cache:'no-store',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if (!response.ok) throw new Error('Payment database operation failed');
 return response.status===204?null:response.json();
}
export async function confirmCheckout(session: Stripe.Checkout.Session) {
 if (session.payment_status!=='paid' || session.mode!=='payment') return;
 const id=session.metadata?.reservation_id, attempt=session.metadata?.attempt_id;
 if (!id || !attempt || session.client_reference_id!==id) throw new Error('Missing payment reference');
 await paymentDb('rpc/confirm_reservation_payment',{p_reservation_id:id,p_attempt_id:attempt,p_session_id:session.id,p_amount:session.amount_total,p_currency:session.currency,p_payment_intent:typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id??null});
}
