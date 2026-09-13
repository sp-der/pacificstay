export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, BedDouble, Home, Mail, MapPin, Users } from 'lucide-react';
import { listManagedProperties } from '../../lib/server/properties';

const PUBLIC_EMAIL = 'info@pacificstayproperties.com';

export default async function StaysPage() {
  const stays = await listManagedProperties();

  return (
    <main className="property-page">
      <header className="property-site-header">
        <Link href="/" className="property-wordmark" aria-label="Pacific Stay Properties home">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </Link>
        <nav>
          <Link href="/stays">Stays</Link>
          <Link href="/#management">Management</Link>
          <Link href="/#story">About Jami</Link>
          <Link href="/#reviews">Reviews</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <a className="property-header-cta" href={`mailto:${PUBLIC_EMAIL}`}>
          Ask Jami <Mail size={15} />
        </a>
      </header>

      <section className="stays-section section-pad">
        <div className="shell">
          <Link href="/" className="property-back-link">
            <ArrowLeft size={16} /> Back to Pacific Stay
          </Link>
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Pacific Stay properties</p>
              <h1 className="display-heading">Find your coastal stay.</h1>
            </div>
            <p className="section-side-copy">
              Browse the homes currently managed by Pacific Stay Properties. Open a listing for full details or book direct when available.
            </p>
          </div>

          {stays.length === 0 ? (
            <div className="stay-card" style={{padding:'34px'}}>
              <h2>New stays are coming soon.</h2>
              <p>Contact Jami for current availability.</p>
            </div>
          ) : (
            <div className="stay-grid">
              {stays.map((stay, index) => (
                <article className="stay-card" key={stay.slug}>
                  <div className="stay-image-wrap">
                    <img src={stay.heroImage || '/PSP.png'} alt={`${stay.name} rental`} />
                    <span className="stay-number">{String(index + 1).padStart(2, '0')}</span>
                    {stay.tag && <span className="stay-tag">{stay.tag}</span>}
                  </div>
                  <div className="stay-card-content">
                    <div className="stay-title-row">
                      <div>
                        {stay.location && <p className="location-line"><MapPin size={15} /> {stay.location}</p>}
                        <h2>{stay.name}</h2>
                      </div>
                      {stay.reviewCount > 0 && stay.rating && (
                        <div className="mock-rate listing-rating">
                          <strong>{stay.rating} ★</strong>
                          <span>{stay.reviewCount} reviews</span>
                        </div>
                      )}
                    </div>
                    <div className="stay-meta">
                      <span><Users size={17} /> {stay.guests} guests</span>
                      <span><BedDouble size={17} /> {stay.beds} beds</span>
                      <span><Home size={17} /> {stay.baths} baths</span>
                    </div>
                    {stay.summary && <p>{stay.summary}</p>}
                    <div className="stay-card-actions">
                      <Link className="text-link" href={`/properties/${stay.slug}`}>
                        View property <ArrowRight size={16} />
                      </Link>
                      <Link className="pill-button direct-booking-link" href={`/book/${stay.slug}`}>
                        Book direct
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
