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
          <p>Your stay is approved and held in the Pacific Stay calendar. Secure card payment will be processed here through Helcim once the merchant connection is activated.</p>
          <div className={styles.securityPoints}>
            <span><LockKeyhole size={17} /> Encrypted checkout</span>
            <span><ShieldCheck size={17} /> Pacific Stay never stores card details</span>
          </div>
        </div>
        <div className={styles.paymentPlaceholder}>
          <CreditCard size={30} />
          <h2>Helcim checkout ready to connect</h2>
          <p>The payment container, reservation handoff, and post-payment confirmation states are built. Connecting the Helcim merchant credentials is the final activation step.</p>
          <button disabled>Secure payment form</button>
          <small>No payment can be submitted until Helcim is connected.</small>
        </div>
      </section>
    </main>
  );
}
