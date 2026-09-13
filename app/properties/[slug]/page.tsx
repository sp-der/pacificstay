export const dynamic = "force-dynamic";
import { getManagedProperty } from "../../../lib/server/properties";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  Check,
  Clock3,
  Home,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
} from "lucide-react";
import BookingCard from "./BookingCard";
import PropertyMotion from "./PropertyMotion";

const PUBLIC_EMAIL = "info@pacificstayproperties.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getManagedProperty(slug);

  if (!property) {
    return { title: "Property | Pacific Stay Properties" };
  }

  return {
    title: `${property.name} | Pacific Stay Properties`,
    description: property.summary || `Explore ${property.name}, managed by Pacific Stay Properties.`,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getManagedProperty(slug);
  if (!property) notFound();

  const hasReviews = Boolean(property.rating && property.reviewCount > 0);
  const mapQuery = encodeURIComponent(property.location || property.area || property.name);
  const mapEmbed = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <main className="property-page">
      <PropertyMotion />

      <header className="property-site-header">
        <Link href="/" className="property-wordmark" aria-label="Pacific Stay Properties home">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </Link>
        <nav>
          <Link href="/stays">Stays</Link>
          <Link href="/#management">Management</Link>
          <Link href="/#story">About Jami</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <a className="property-header-cta" href={`mailto:${PUBLIC_EMAIL}`}>
          Ask Jami <Mail size={15} />
        </a>
      </header>

      <section className="property-title-section">
        <div className="property-shell">
          <Link href="/stays" className="property-back-link">
            <ArrowLeft size={16} /> Back to stays
          </Link>
          <div className="property-title-grid">
            <div>
              <p className="property-eyebrow">Pacific Stay property</p>
              <h1>{property.name}</h1>
              {property.location && <p className="property-location"><MapPin size={17} /> {property.location}</p>}
            </div>
            <div className="property-title-note">
              {property.tag && <span>{property.tag}</span>}
              <p>
                {hasReviews
                  ? `${property.guestFavorite ? "Guest favorite · " : ""}${property.rating} out of 5 from ${property.reviewCount} Airbnb reviews.`
                  : "Professionally managed by Pacific Stay Properties."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="property-gallery property-shell" aria-label={`${property.name} gallery`}>
        <div className="property-gallery-main">
          <img src={property.heroImage || "/PSP.png"} alt={`${property.name} exterior`} />
        </div>
        <div className="property-gallery-side">
          {property.gallery.map((image, index) => (
            <div key={image}>
              <img src={image} alt={`${property.name} gallery photo ${index + 2}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="property-body property-shell">
        <aside className="property-booking-column">
          <BookingCard slug={property.slug} name={property.name} guests={property.guests} />
          <div className="property-booking-help">
            <strong>Questions before booking?</strong>
            <p>Jami provides local guest support and can help with property-specific questions.</p>
            <a href="tel:+17604296633"><Phone size={15} /> Call Jami</a>
          </div>
        </aside>

        <div className="property-content-column">
          <div className="property-quick-facts">
            <div><Users size={20} /><span><strong>{property.guests}</strong> guests</span></div>
            <div><Home size={20} /><span><strong>{property.bedrooms}</strong> bedrooms</span></div>
            <div><BedDouble size={20} /><span><strong>{property.beds}</strong> beds</span></div>
            <div><Bath size={20} /><span><strong>{property.baths}</strong> baths</span></div>
            <div><KeyRound size={20} /><span><strong>{property.propertyType}</strong></span></div>
          </div>

          <section className="property-copy-section">
            <p className="property-eyebrow">The stay</p>
            {property.tag && <h2>{property.tag}</h2>}
            {property.summary && <p className="property-summary">{property.summary}</p>}
            {property.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>

          {property.highlights.length > 0 && <section className="property-copy-section">
            <p className="property-eyebrow">Listing highlights</p>
            <div className="property-highlight-grid">
              {property.highlights.map((highlight) => (
                <div key={highlight}><Sparkles size={19} /><span>{highlight}</span></div>
              ))}
            </div>
          </section>}

          {hasReviews && <section className="property-copy-section property-review-section">
            <p className="property-eyebrow">{property.guestFavorite ? "Guest favorite" : "Guest reviews"}</p>
            <div className="property-rating-header">
              <div>
                <Star size={24} fill="currentColor" />
                <strong>{property.rating}</strong>
                <span>{property.reviewCount} Airbnb reviews</span>
              </div>
              {property.airbnbUrl && <a href={property.airbnbUrl} target="_blank" rel="noreferrer">View current reviews on Airbnb</a>}
            </div>
            {property.reviewScores.length > 0 && <div className="property-review-score-grid">
              {property.reviewScores.map((item) => (
                <div key={item.label}><span>{item.label}</span><strong>{item.score}</strong></div>
              ))}
            </div>}
          </section>}

          {property.sleeping.length > 0 && <section className="property-copy-section">
            <p className="property-eyebrow">Sleeping arrangements</p>
            <h2>Room to settle in.</h2>
            <div className="sleeping-grid">
              {property.sleeping.map((space) => (
                <article key={space.room}>
                  <BedDouble size={24} />
                  <h3>{space.room}</h3>
                  <strong>{space.bed}</strong>
                  <p>{space.note}</p>
                </article>
              ))}
            </div>
          </section>}

          {property.amenities.length > 0 && <section className="property-copy-section">
            <p className="property-eyebrow">Amenities</p>
            <h2>Built for beach days and easy evenings.</h2>
            <div className="amenity-group-grid">
              {property.amenities.map((group) => (
                <div className="amenity-group" key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => <li key={item}><Check size={15} /> {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>}

          <section className="property-copy-section">
            <p className="property-eyebrow">Arrival &amp; access</p>
            <div className="arrival-grid">
              <div><Clock3 size={22} /><span><small>Check-in</small><strong>{property.checkIn || "Ask Jami"}</strong></span></div>
              <div><Clock3 size={22} /><span><small>Check-out</small><strong>{property.checkOut || "Ask Jami"}</strong></span></div>
              <div><Car size={22} /><span><small>Parking</small><strong>{property.parking || "See listing details"}</strong></span></div>
              <div><Wifi size={22} /><span><small>Internet</small><strong>{property.wifi || "See listing details"}</strong></span></div>
              <div><KeyRound size={22} /><span><small>Access</small><strong>{property.access || "Provided before arrival"}</strong></span></div>
            </div>
          </section>

          {(property.houseRules.length > 0 || property.safety.length > 0 || property.cancellationPolicy) && <section className="property-copy-section property-two-column-details">
            <div>
              <p className="property-eyebrow">House rules</p>
              {property.cancellationPolicy && <p>{property.cancellationPolicy}</p>}
              <h2>Good to know.</h2>
              <ul className="property-rule-list">
                {property.houseRules.map((rule) => <li key={rule}><Check size={16} /> {rule}</li>)}
              </ul>
            </div>
            <div>
              <p className="property-eyebrow">Safety &amp; property</p>
              <h2>Guest-ready basics.</h2>
              <ul className="property-rule-list">
                {property.safety.map((item) => <li key={item}><ShieldCheck size={16} /> {item}</li>)}
              </ul>
            </div>
          </section>}

          {property.location && <section className="property-copy-section">
            <p className="property-eyebrow">Location</p>
            <h2>{property.location}</h2>
            <div className="property-location-card">
              <div className="location-graphic"><MapPin size={30} /></div>
              <div>
                <strong>{property.area || property.location}</strong>
                {property.locationCopy && <p>{property.locationCopy}</p>}
              </div>
            </div>

            <div className="property-google-map">
              <div className="property-google-map-frame">
                <iframe
                  src={mapEmbed}
                  title={`${property.location} area map`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="property-google-map-footer">
                <div>
                  <span className="property-google-map-eyebrow">Explore the area</span>
                  <strong>{property.area || property.location}</strong>
                </div>
                <a href={mapLink} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
              </div>
              <div className="property-nearby-strip">
                <span>Coastal access</span>
                <span>Local dining</span>
                <span>Neighborhood favorites</span>
                <span>North County Coastal</span>
              </div>
            </div>
          </section>}

          <section className="property-host-section">
            <div className="property-host-avatar property-host-photo" aria-label="Jami Jimenez" />
            <div>
              <p className="property-eyebrow">Managed locally</p>
              <h2>Meet Jami Jimenez.</h2>
              <p>
                Local Airbnb Host and Short-Term Rental Manager providing hands-on support,
                proactive communication, and on-site assistance across North County Coastal.
              </p>
              <div className="property-host-links">
                <a href="tel:+17604296633"><Phone size={16} /> 760-429-6633</a>
                <a href={`mailto:${PUBLIC_EMAIL}`}><Mail size={16} /> Email Jami</a>
              </div>
            </div>
          </section>
        </div>
      </section>

      <footer className="property-footer">
        <div className="property-shell">
          <div className="property-wordmark footer-property-wordmark">
            <span>PACIFIC STAY</span>
            <small>PROPERTIES</small>
          </div>
          <p>Local. Reliable. Detail oriented.</p>
          <span>Del Mar • La Jolla • Encinitas • Carlsbad • Oceanside</span>
        </div>
      </footer>
    </main>
  );
}
