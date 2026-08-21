"use client";

import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Home,
  KeyRound,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Waves,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Stay = {
  name: string;
  location: string;
  image: string;
  guests: number;
  beds: number;
  baths: number;
  price: number;
  tag: string;
  description: string;
};

const stays: Stay[] = [
  {
    name: "The Pacific House",
    location: "Southern California Coast",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=88",
    guests: 8,
    beds: 4,
    baths: 3,
    price: 495,
    tag: "Ocean-view escape",
    description:
      "Sun-washed interiors, open-air gathering spaces, and an easygoing coastal rhythm made for slow mornings and golden-hour dinners.",
  },
  {
    name: "Salt + Sand Retreat",
    location: "California Coast",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=88",
    guests: 6,
    beds: 3,
    baths: 2,
    price: 365,
    tag: "Steps from the coast",
    description:
      "A calm, design-forward stay with airy rooms, warm natural textures, and everything guests need for a polished weekend by the water.",
  },
];

const services = [
  {
    icon: KeyRound,
    title: "Guest Experience",
    copy: "Thoughtful communication, smooth arrivals, and attentive support from booking through checkout.",
  },
  {
    icon: Sparkles,
    title: "Turnovers + Care",
    copy: "Presentation-focused cleaning coordination, restocking, and property checks between every stay.",
  },
  {
    icon: Compass,
    title: "Listing Strategy",
    copy: "Positioning, photography direction, pricing strategy, and a guest-first listing experience designed to convert.",
  },
  {
    icon: ShieldCheck,
    title: "Owner Peace of Mind",
    copy: "A boutique management approach with clear communication and eyes on the details that protect your home.",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function openBooking(stay: Stay) {
    setSubmitted(false);
    setSelectedStay(stay);
  }

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>
      <div className="intro-screen" aria-hidden="true">
        <div className="intro-mark">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </div>
      </div>

      <header className="site-header">
        <button
          className="wordmark"
          onClick={() => scrollToId("top")}
          aria-label="Go to top"
        >
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button onClick={() => scrollToId("stays")}>Stays</button>
          <button onClick={() => scrollToId("management")}>Management</button>
          <button onClick={() => scrollToId("story")}>About</button>
          <button onClick={() => scrollToId("contact")}>Contact</button>
        </nav>

        <button
          className="nav-cta desktop-only"
          onClick={() => scrollToId("stays")}
        >
          Book a stay <ArrowRight size={16} />
        </button>

        <button
          className="mobile-menu-button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-top">
            <div className="wordmark static-mark">
              <span>PACIFIC STAY</span>
              <small>PROPERTIES</small>
            </div>
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X size={26} />
            </button>
          </div>
          <div className="mobile-menu-links">
            {[
              ["stays", "Stays"],
              ["management", "Management"],
              ["story", "About"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setMenuOpen(false);
                  scrollToId(id);
                }}
              >
                {label} <ArrowRight size={20} />
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="hero" id="top">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=90"
        >
          <source
            src="https://videos.pexels.com/video-files/11329984/11329984-hd_1920_1080_30fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-overlay" />
        <div className="hero-grain" />

        <div className="hero-content shell">
          <p className="eyebrow light-eyebrow">
            <Waves size={17} /> Coastal stays, thoughtfully managed
          </p>
          <h1>
            Stay near the sea.
            <span>Leave the details to us.</span>
          </h1>
          <p className="hero-copy">
            Pacific Stay Properties creates polished coastal escapes for guests
            and a more effortless short-term rental experience for homeowners.
          </p>
          <div className="hero-actions">
            <button className="button button-light" onClick={() => scrollToId("stays")}>
              Explore our stays <ArrowRight size={17} />
            </button>
            <button
              className="button button-ghost"
              onClick={() => scrollToId("management")}
            >
              List your property
            </button>
          </div>
        </div>

        <div className="hero-bottom shell">
          <span>California Coast</span>
          <button onClick={() => scrollToId("stays")}>
            Scroll to explore <ChevronDown size={17} />
          </button>
        </div>
      </section>

      <section className="intro-copy-section section-pad">
        <div className="shell intro-grid">
          <p className="eyebrow">The Pacific Stay feeling</p>
          <div>
            <h2 className="display-heading">
              A better stay starts with the feeling you get before you even
              unlock the door.
            </h2>
            <p className="lead-copy">
              We pair elevated hospitality with hands-on property care, creating
              stays that feel relaxed for guests and management that feels
              refreshingly simple for owners.
            </p>
          </div>
        </div>
      </section>

      <section className="stays-section section-pad" id="stays">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Featured stays</p>
              <h2 className="display-heading">Your coast is calling.</h2>
            </div>
            <p className="section-side-copy">
              Two sample homes are staged here for the first client mock. Real
              listing photos, names, rates, and availability can drop in later.
            </p>
          </div>

          <div className="stay-grid">
            {stays.map((stay, index) => (
              <article className="stay-card" key={stay.name}>
                <div className="stay-image-wrap">
                  <img src={stay.image} alt={`${stay.name} coastal rental`} />
                  <span className="stay-number">0{index + 1}</span>
                  <span className="stay-tag">{stay.tag}</span>
                </div>
                <div className="stay-card-content">
                  <div className="stay-title-row">
                    <div>
                      <p className="location-line">
                        <MapPin size={15} /> {stay.location}
                      </p>
                      <h3>{stay.name}</h3>
                    </div>
                    <div className="mock-rate">
                      <strong>${stay.price}</strong>
                      <span>/ night</span>
                    </div>
                  </div>
                  <div className="stay-meta">
                    <span><Users size={17} /> {stay.guests} guests</span>
                    <span><BedDouble size={17} /> {stay.beds} beds</span>
                    <span><Home size={17} /> {stay.baths} baths</span>
                  </div>
                  <p>{stay.description}</p>
                  <div className="stay-card-actions">
                    <button className="text-link">View property <ArrowRight size={16} /></button>
                    <button className="pill-button" onClick={() => openBooking(stay)}>
                      Check dates
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="split-path-section">
        <div className="path-card guest-path">
          <div className="path-shade" />
          <div className="path-content">
            <p className="eyebrow light-eyebrow">For guests</p>
            <h2>Find your next coastal reset.</h2>
            <p>
              Design-led homes, easy arrivals, local recommendations, and a stay
              that feels cared for from the first click.
            </p>
            <button className="button button-light" onClick={() => scrollToId("stays")}>
              Browse stays <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="path-card owner-path">
          <div className="path-shade" />
          <div className="path-content">
            <p className="eyebrow light-eyebrow">For homeowners</p>
            <h2>Own the home. Not the workload.</h2>
            <p>
              Boutique short-term rental management built around presentation,
              communication, and protecting the guest experience.
            </p>
            <button
              className="button button-light"
              onClick={() => scrollToId("management")}
            >
              Explore management <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="management-section section-pad" id="management">
        <div className="shell">
          <div className="management-top">
            <div>
              <p className="eyebrow">Property management</p>
              <h2 className="display-heading">
                Your home deserves more than a listing.
              </h2>
            </div>
            <p className="lead-copy compact-copy">
              Pacific Stay is being shaped as a hands-on management partner for
              owners who want strong presentation without living inside their
              booking inbox.
            </p>
          </div>

          <div className="service-grid">
            {services.map(({ icon: Icon, title, copy }, index) => (
              <div className="service-card" key={title}>
                <div className="service-card-top">
                  <span>0{index + 1}</span>
                  <Icon size={24} strokeWidth={1.6} />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>

          <div className="management-feature">
            <div className="management-feature-image">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=88"
                alt="Bright coastal rental interior"
              />
            </div>
            <div className="management-feature-copy">
              <p className="eyebrow">Simple by design</p>
              <h3>Three steps from property to Pacific Stay.</h3>
              <div className="steps-list">
                <div>
                  <span>01</span>
                  <div><strong>Connect</strong><p>We learn the home, goals, market, and what kind of experience you want to create.</p></div>
                </div>
                <div>
                  <span>02</span>
                  <div><strong>Prepare + launch</strong><p>We shape the presentation, listing strategy, guest flow, and operating details.</p></div>
                </div>
                <div>
                  <span>03</span>
                  <div><strong>Relax + host</strong><p>Pacific Stay handles the moving pieces while the home stays guest-ready.</p></div>
                </div>
              </div>
              <button className="dark-link" onClick={() => scrollToId("contact")}>
                Talk about your property <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-break">
        <div className="quote-break-image" />
        <div className="quote-break-shade" />
        <div className="shell quote-break-content">
          <Star size={21} fill="currentColor" />
          <p>Come for the coast. Remember the stay.</p>
          <span>Pacific Stay Properties</span>
        </div>
      </section>

      <section className="story-section section-pad" id="story">
        <div className="shell story-grid">
          <div className="story-image collage-main">
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85"
              alt="Coastal lifestyle"
            />
          </div>
          <div className="story-copy">
            <p className="eyebrow">About Pacific Stay</p>
            <h2 className="display-heading">Boutique by nature.</h2>
            <p className="lead-copy">
              Pacific Stay Properties is presented here as a modern coastal
              hospitality company with a personal, locally minded approach to
              short-term rentals.
            </p>
            <p>
              For this first mock, we are intentionally keeping the story honest
              and flexible. Once the client shares her background, service area,
              and hosting philosophy, this section can become the real brand
              story instead of generic filler.
            </p>
            <div className="story-points">
              <span><Check size={16} /> Guest-first hospitality</span>
              <span><Check size={16} /> Hands-on property care</span>
              <span><Check size={16} /> Coastal-minded presentation</span>
            </div>
          </div>
          <div className="story-image collage-small">
            <img
              src="https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&w=1000&q=85"
              alt="Ocean shoreline"
            />
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="shell contact-inner">
          <div>
            <p className="eyebrow light-eyebrow">Let’s make it easy</p>
            <h2>Looking for a stay, or looking for a partner?</h2>
          </div>
          <div className="contact-actions">
            <button className="button button-light" onClick={() => scrollToId("stays")}>
              Find a stay <ArrowRight size={17} />
            </button>
            <a className="button button-outline-light" href="mailto:hello@pacificstayproperties.com">
              Manage my property
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <div className="wordmark static-mark footer-wordmark">
              <span>PACIFIC STAY</span>
              <small>PROPERTIES</small>
            </div>
            <p>Coastal stays. Thoughtfully managed.</p>
          </div>
          <div>
            <span className="footer-label">Explore</span>
            <button onClick={() => scrollToId("stays")}>Stays</button>
            <button onClick={() => scrollToId("management")}>Management</button>
            <button onClick={() => scrollToId("story")}>About</button>
          </div>
          <div>
            <span className="footer-label">Connect</span>
            <a href="mailto:hello@pacificstayproperties.com">Email us</a>
            <a href="#contact">Property inquiry</a>
            <a href="#stays">Direct booking</a>
          </div>
          <div className="footer-note">
            <span>First-round website mock</span>
            <p>Brand copy, listings, contact details, and rates are placeholders pending client approval.</p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Pacific Stay Properties</span>
          <span>California</span>
        </div>
      </footer>

      {selectedStay && (
        <div className="booking-overlay" role="dialog" aria-modal="true" aria-label="Mock direct booking">
          <button
            className="booking-backdrop"
            aria-label="Close booking"
            onClick={() => setSelectedStay(null)}
          />
          <div className="booking-panel">
            <div className="booking-panel-top">
              <div>
                <span className="mini-label">Mock direct booking</span>
                <h2>{selectedStay.name}</h2>
                <p><MapPin size={15} /> {selectedStay.location}</p>
              </div>
              <button className="close-button" onClick={() => setSelectedStay(null)} aria-label="Close">
                <X size={22} />
              </button>
            </div>

            <div className="booking-image">
              <img src={selectedStay.image} alt={selectedStay.name} />
            </div>

            {!submitted ? (
              <form onSubmit={submitBooking} className="booking-form">
                <div className="booking-form-grid">
                  <label>
                    <span><CalendarDays size={15} /> Check-in</span>
                    <input type="date" min={today} required />
                  </label>
                  <label>
                    <span><CalendarDays size={15} /> Check-out</span>
                    <input type="date" min={today} required />
                  </label>
                  <label className="full-field">
                    <span><Users size={15} /> Guests</span>
                    <select defaultValue="2">
                      {Array.from({ length: selectedStay.guests }, (_, i) => i + 1).map((guest) => (
                        <option value={guest} key={guest}>{guest} guest{guest > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="booking-summary">
                  <div><span>Sample nightly rate</span><strong>${selectedStay.price}</strong></div>
                  <div><span>Cleaning + taxes</span><strong>Calculated later</strong></div>
                  <div className="booking-total"><span>Booking system</span><strong>Demo only</strong></div>
                </div>
                <button className="booking-submit" type="submit">
                  Request to book <ArrowRight size={17} />
                </button>
                <small>No charge will be made. This is a presentation mock for the client.</small>
              </form>
            ) : (
              <div className="booking-success">
                <div className="success-icon"><Check size={28} /></div>
                <span className="mini-label">Demo complete</span>
                <h3>This is where the real booking flow will continue.</h3>
                <p>
                  Once Pacific Stay chooses its PMS or booking provider, this panel can sync live availability, pricing, taxes, policies, and payments.
                </p>
                <button className="booking-submit" onClick={() => setSelectedStay(null)}>Back to the site</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
