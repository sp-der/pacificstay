import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, ShieldCheck, Star } from "lucide-react";
import { getProperty, properties } from "../../properties/propertyData";
import DirectBookingForm from "./DirectBookingForm";
import styles from "./book.module.css";

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return { title: "Direct Booking | Pacific Stay Properties" };
  return {
    title: `Book ${property.name} Direct | Pacific Stay Properties`,
    description: `Plan a direct stay at ${property.name} in ${property.location} with Pacific Stay Properties.`,
  };
}

export default async function DirectBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </Link>
        <div className={styles.headerActions}>
          <Link href={`/properties/${property.slug}`}><ArrowLeft size={15} /> Property details</Link>
          <a href="mailto:info@pacificstayproperties.com">Questions? <Mail size={15} /></a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <img src={property.heroImage} alt={`${property.name} exterior`} />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <p>Direct booking · Pacific Stay Properties</p>
            <h1>{property.name}</h1>
            <span><MapPin size={16} /> {property.location}</span>
          </div>
        </div>
        <div className={styles.heroDetails}>
          <p className={styles.eyebrow}>Book with the local host</p>
          <h2>A simpler way to stay by the coast.</h2>
          <p>
            Choose your dates, review an estimated direct price, and send your stay request to Pacific Stay.
            Availability is checked against the connected property calendar before your request is submitted.
          </p>
          <div className={styles.trustGrid}>
            <div><Star size={18} fill="currentColor" /><strong>{property.rating}</strong><span>{property.reviewCount} Airbnb reviews</span></div>
            <div><ShieldCheck size={18} /><strong>Local support</strong><span>Managed by Jami Jimenez</span></div>
          </div>
        </div>
      </section>

      <section className={styles.bookingSection}>
        <div className={styles.bookingIntro}>
          <p className={styles.eyebrow}>Plan your stay</p>
          <h2>Book Chestnut direct.</h2>
          <p>Select your dates to view the estimated direct-booking price for your stay.</p>
          <div className={styles.policyCards}>
            <div><strong>{property.minNights} nights</strong><span>Minimum stay</span></div>
            <div><strong>{property.guests} guests</strong><span>Maximum occupancy</span></div>
            <div><strong>No pets</strong><span>House rule</span></div>
          </div>
          <p className={styles.rateNote}>
            Direct pricing can be adjusted independently from Airbnb, allowing Pacific Stay to offer a direct-booking advantage when desired.
          </p>
        </div>

        <DirectBookingForm slug={property.slug} name={property.name} maxGuests={property.guests} />
      </section>

      <footer className={styles.footer}>
        <Link href={`/properties/${property.slug}`}>← Back to {property.name}</Link>
        <span>info@pacificstayproperties.com · 760-429-6633</span>
      </footer>
    </main>
  );
}
