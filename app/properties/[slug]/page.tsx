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
  Users,
  Wifi,
} from "lucide-react";
import BookingCard from "./BookingCard";
import { getProperty, properties } from "../propertyData";

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);

  if (!property) {
    return { title: "Property | Pacific Stay Properties" };
  }

  return {
    title: `${property.name} | Pacific Stay Properties`,
    description: `${property.summary} Presentation listing for Pacific Stay Properties.`,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  const otherProperty = properties.find((item) => item.slug !== property.slug)!;

  return (
    <main className="property-page">
      <header className="property-site-header">
        <Link href="/" className="property-wordmark" aria-label="Pacific Stay Properties home">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </Link>
        <nav>
          <Link href="/#stays">Stays</Link>
          <Link href="/#management">Management</Link>
          <Link href="/#story">About Jami</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <a className="property-header-cta" href="mailto:Jami.jimenez718@gmail.com">
          Ask Jami <Mail size={15} />
        </a>
      </header>

      <section className="property-title-section">
        <div className="property-shell">
          <Link href="/#stays" className="property-back-link">
            <ArrowLeft size={16} /> Back to stays
          </Link>
          <div className="property-title-grid">
            <div>
              <p className="property-eyebrow">Sample direct-booking property</p>
              <h1>{property.name}</h1>
              <p className="property-location"><MapPin size={17} /> {property.location}</p>
            </div>
            <div className="property-title-note">
              <span>{property.tag}</span>
              <p>
                This is a presentation listing. Photos, rates, amenities, house
                rules, and property specifics will be replaced with the real
                listing information when provided.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="property-gallery property-shell" aria-label={`${property.name} gallery`}>
        <div className="property-gallery-main">
          <img src={property.heroImage} alt={`${property.name} exterior`} />
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
        <div className="property-content-column">
          <div className="property-quick-facts">
            <div><Users size={20} /><span><strong>{property.guests}</strong> guests</span></div>
            <div><Home size={20} /><span><strong>{property.bedrooms}</strong> bedrooms</span></div>
            <div><BedDouble size={20} /><span><strong>{property.beds}</strong> beds</span></div>
            <div><Bath size={20} /><span><strong>{property.baths}</strong> baths</span></div>
            <div><KeyRound size={20} /><span><strong>Entire</strong> home</span></div>
          </div>

          <section className="property-copy-section">
            <p className="property-eyebrow">The stay</p>
            <h2>Coastal comfort, handled with care.</h2>
            <p className="property-summary">{property.summary}</p>
            {property.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>

          <section className="property-copy-section">
            <p className="property-eyebrow">Why guests will love it</p>
            <div className="property-highlight-grid">
              {property.highlights.map((highlight) => (
                <div key={highlight}><Sparkles size={19} /><span>{highlight}</span></div>
              ))}
            </div>
          </section>

          <section className="property-copy-section">
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
          </section>

          <section className="property-copy-section">
            <p className="property-eyebrow">Amenities</p>
            <h2>Everything guests look for before they book.</h2>
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
          </section>

          <section className="property-copy-section">
            <p className="property-eyebrow">Arrival & access</p>
            <div className="arrival-grid">
              <div><Clock3 size={22} /><span><small>Check-in</small><strong>{property.checkIn}</strong></span></div>
              <div><Clock3 size={22} /><span><small>Check-out</small><strong>{property.checkOut}</strong></span></div>
              <div><Car size={22} /><span><small>Parking</small><strong>{property.parking}</strong></span></div>
              <div><Wifi size={22} /><span><small>Internet</small><strong>{property.wifi}</strong></span></div>
              <div><KeyRound size={22} /><span><small>Access</small><strong>{property.access}</strong></span></div>
            </div>
          </section>

          <section className="property-copy-section property-two-column-details">
            <div>
              <p className="property-eyebrow">Sample house rules</p>
              <h2>Good to know.</h2>
              <ul className="property-rule-list">
                {property.houseRules.map((rule) => <li key={rule}><Check size={16} /> {rule}</li>)}
              </ul>
            </div>
            <div>
              <p className="property-eyebrow">Safety</p>
              <h2>Guest-ready basics.</h2>
              <ul className="property-rule-list">
                {property.safety.map((item) => <li key={item}><ShieldCheck size={16} /> {item}</li>)}
              </ul>
            </div>
          </section>

          <section className="property-copy-section">
            <p className="property-eyebrow">Location</p>
            <h2>{property.location}</h2>
            <div className="property-location-card">
              <div className="location-graphic"><MapPin size={30} /></div>
              <div>
                <strong>{property.area}</strong>
                <p>{property.locationCopy}</p>
              </div>
            </div>
          </section>

          <section className="property-host-section">
            <div className="property-host-avatar">JJ</div>
            <div>
              <p className="property-eyebrow">Hosted & managed locally</p>
              <h2>Meet Jami Jimenez.</h2>
              <p>
                Local Airbnb Host and Short-Term Rental Manager providing
                hands-on support, proactive communication, and on-site assistance
                across North County Coastal.
              </p>
              <div className="property-host-links">
                <a href="tel:+17604296633"><Phone size={16} /> 760-429-6633</a>
                <a href="mailto:Jami.jimenez718@gmail.com"><Mail size={16} /> Email Jami</a>
              </div>
            </div>
          </section>
        </div>

        <aside className="property-booking-column">
          <BookingCard name={property.name} price={property.price} guests={property.guests} />
          <div className="property-booking-help">
            <strong>Questions before booking?</strong>
            <p>Jami provides local guest support and can help with property-specific questions.</p>
            <a href="tel:+17604296633"><Phone size={15} /> Call Jami</a>
          </div>
        </aside>
      </section>

      <section className="property-next-stay">
        <div className="property-shell property-next-grid">
          <div>
            <p className="property-eyebrow">Another Pacific Stay</p>
            <h2>Keep exploring the coast.</h2>
            <p>{otherProperty.summary}</p>
            <Link href={`/properties/${otherProperty.slug}`}>
              View {otherProperty.name}
            </Link>
          </div>
          <Link href={`/properties/${otherProperty.slug}`} className="property-next-image">
            <img src={otherProperty.heroImage} alt={otherProperty.name} />
          </Link>
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
