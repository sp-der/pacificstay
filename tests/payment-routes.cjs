const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const Stripe=require('stripe');
const {NextResponse}=require('next/server');
function load(file,deps){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>{if(name in deps)return deps[name];throw Error(name)},process,console,URL,Date});return exports;}
(async()=>{
 process.env.NEXT_PUBLIC_SITE_URL='https://pacificstay.vercel.app';process.env.STRIPE_WEBHOOK_SECRET='whsec_fixture';
 const stripe=new Stripe('sk_test_fixture');let ready=true;const writes=[];
 const deps={paymentsConfigured:()=>ready,stripeClient:()=>stripe,paymentDb:async(path,body)=>{writes.push({path,body});return {attempt_id:'fixture-attempt',amount_cents:24200,expires_at:new Date(Date.now()+2100000).toISOString(),property_name:'Test Stay',guest_email:'test@example.invalid',confirmation_code:'PS-TEST'};},confirmCheckout:async s=>{writes.push({confirmed:s.id});}};
 const webhook=load('app/api/payments/webhook/route.ts',{'next/server':{NextResponse},'../../../../lib/server/payments':deps});
 const raw=JSON.stringify({id:'evt_test',type:'checkout.session.completed',data:{object:{id:'cs_test',payment_status:'paid'}}});
 const request=(body,sig)=>new Request('https://pacificstay.vercel.app/api/payments/webhook',{method:'POST',body,headers:{'stripe-signature':sig}});
 assert.equal((await webhook.POST(request(raw,'invalid'))).status,400);
 const signature=stripe.webhooks.generateTestHeaderString({payload:raw,secret:'whsec_fixture'});
 assert.equal((await webhook.POST(request(raw,signature))).status,200);assert.equal(writes.pop().confirmed,'cs_test');
 assert.equal((await webhook.POST(request(raw+' ',signature))).status,400);
 const expired=JSON.stringify({id:'evt_expired',type:'checkout.session.expired',data:{object:{id:'cs_expired',metadata:{reservation_id:'reservation',attempt_id:'attempt'}}}});
 assert.equal((await webhook.POST(request(expired,stripe.webhooks.generateTestHeaderString({payload:expired,secret:'whsec_fixture'})))).status,200);assert.equal(writes.pop().body.status,'expired');
 const checkout=load('app/api/payments/checkout/route.ts',{'next/server':{NextResponse},'../../../../lib/server/payments':deps});
 const id='00000000-0000-4000-a000-000000009912';let sent;
 stripe.checkout.sessions.create=async(params,options)=>{sent={params,options};return{id:'cs_test',url:'https://checkout.stripe.com/test'};};
 const pay=(origin,body)=>new Request('https://pacificstay.vercel.app/api/payments/checkout',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await checkout.POST(pay('https://evil.example',{reservationId:id}))).status,403);
 assert.equal((await checkout.POST(pay('https://pacificstay.vercel.app',{reservationId:'invalid'}))).status,400);
 const result=await checkout.POST(pay('https://pacificstay.vercel.app',{reservationId:id,amount:1,property:'tampered'}));assert.equal(result.status,200);
 assert.equal(sent.params.line_items[0].price_data.unit_amount,24200);assert.equal(sent.options.idempotencyKey,'reservation-fixture-attempt');assert(sent.params.success_url.endsWith('?payment=success'));assert(sent.params.cancel_url.endsWith('/checkout?payment=cancelled'));
 ready=false;assert.equal((await checkout.POST(pay('https://pacificstay.vercel.app',{reservationId:id}))).status,503);
 console.log('PASS: webhook signatures/tampering, expiry, origin/UUID checks, server amount, idempotency, success/cancel redirects, missing-configuration handling. Stripe network calls mocked.');
})().catch(e=>{console.error(e);process.exit(1)});
