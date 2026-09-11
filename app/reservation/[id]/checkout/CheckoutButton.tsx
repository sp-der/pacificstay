'use client';
import {useState} from 'react';
export default function CheckoutButton({reservationId}:{reservationId:string}) {
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function pay(){setBusy(true);setError('');try{
  const r=await fetch('/api/payments/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reservationId})});
  const data=await r.json();if(!r.ok||!data.url)throw Error(data.error||'Checkout unavailable.');window.location.assign(data.url);
 }catch(e){setError(e instanceof Error?e.message:'Checkout unavailable.');setBusy(false);}}
 return <><button onClick={pay} disabled={busy}>{busy?'Opening secure checkout…':'Pay with Stripe'}</button>{error&&<p role="alert">{error}</p>}</>;
}
