import CheckoutButton from "./CheckoutButton";
import Link from "next/link";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import styles from "../reservation.module.css";

export default async function ReservationCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><span>PACIFIC STAY</span><small>PROPERTIES</small></Link>
        <Link href={`/reservation/${id}`}>← Back to reservation</Link>
      </header>
      <section className={styles.checkoutShell}>
        <div className={styles.checkoutIntro}>
          <p className={styles.eyebrow}>Secure checkout</p>
          <h1>Complete your reservation.</h1>
          <p>Your stay is approved and held in the Pacific Stay calendar. Pay securely on Stripe to confirm your stay. If you cancelled checkout or your card was declined, you can try again.</p>
          <div className={styles.securityPoints}>
            <span><LockKeyhole size={17} /> Encrypted checkout</span>
            <span><ShieldCheck size={17} /> Pacific Stay never stores card details</span>
          </div>
        </div>
        <div className={styles.paymentPlaceholder}>
          <CreditCard size={30} />
          <h2>Secure card payment</h2>
          <p>Your approved reservation total is verified before Stripe opens. Your reservation is confirmed only after Stripe verifies payment.</p>
          <CheckoutButton reservationId={id} />
          <small>Returning here without paying does not cancel your reservation request.</small>
        </div>
      </section>
    </main>
  );
}
