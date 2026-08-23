"use client";

import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Check,
  ChevronDown,
  CircleDollarSign,
  Home,
  KeyRound,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  Waves,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";

type Stay = {
  slug: string;
  name: string;
  location: string;
  image: string;
  guests: number;
  beds: number;
  baths: number;
  rating: string;
  reviews: number;
  tag: string;
  description: string;
  airbnbUrl: string;
};

const stays: Stay[] = [
  {
    slug: "chestnut-by-the-sea",
    name: "Chestnut By the Sea",
    location: "Carlsbad, California",
    image:
      "https://a0.muscache.com/im/pictures/hosting/Hosting-1553757930360534380/original/5c5954bb-afdb-4cdc-aa69-11f27d3d1f0e.jpeg?im_w=720",
    guests: 6,
    beds: 3,
    baths: 2,
    rating: "4.88",
    reviews: 24,
    tag: "Steps from Carlsbad State Beach",
    description:
      "A luxury Bali-inspired coastal stay with a jacuzzi, fire pit, outdoor shower, BBQ patio, beach cruisers, and easy access to Carlsbad Village.",
    airbnbUrl: "https://www.airbnb.com/h/chestnutbytheseav2",
  },
];

const serviceAreas = ["Del Mar", "La Jolla", "Encinitas", "Carlsbad", "Oceanside"];

const services = [
  {
    icon: MessageCircle,
    title: "Guest Communication",
    copy:
      "Prompt, professional 5-star guest communication and support from booking through the stay.",
  },
  {
    icon: KeyRound,
    title: "Check-In & Check-Out",
    copy:
      "Seamless, secure, and on-time arrivals and departures for a smoother guest experience.",
  },
  {
    icon: PackageCheck,
    title: "Supplies & Inventory",
    copy:
      "Ordering and restocking household supplies and guest essentials so the property stays ready.",
  },
  {
    icon: CircleDollarSign,
    title: "Calendar & Revenue Management",
    copy:
      "Monitor the calendar and adjust pricing strategies to optimize income and occupancy.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Vendor Coordination",
    copy:
      "Coordinate repairs and trusted vendors for HVAC, plumbing, pool, landscaping, and more.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Compliance",
    copy:
      "Test smoke and CO detectors monthly and review insurance guidelines to help protect the property.",
  },
  {
    icon: Star,
    title: "5-Star Standards",
    copy:
      "Ensure every detail supports outstanding guest experiences and the kind of stays that earn strong reviews.",
  },
  {
    icon: Home,
    title: "On-Site Property Support",
    copy:
      "Available locally to respond to guest concerns, emergencies, and property needs when they arise.",
  },
  {
    icon: UserRound,
    title: "Owner Updates & Reporting",
    copy:
      "Regular communication and property updates so owners always know what is happening with their investment.",
  },
];

const testimonials = [
  {
    name: "Stephanie Mende",
    quote:
      "Jami is an exceptional host and property manager. She is incredibly responsive, communicates clearly, and goes above and beyond to ensure both guests and owners have a seamless experience. Her attention to detail, professionalism, and genuine care make all the difference.",
  },
  {
    name: "Shirley Slee",
    quote:
      "Jami is a trusted property manager who keeps my Airbnb operating smoothly and efficiently. She manages guest communication, oversees inventory and restocking, monitors my Airbnb calendar, and consistently responds when property needs arise. Her professionalism, reliability, and attention to detail have contributed directly to maintaining Superhost standards and exceptional guest experiences.",
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <div className="intro-screen" aria-hidden="true">
        <div className="intro-mark">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </div>
      </div>

      <header className="site-header">
        <button className="wordmark" onClick={() => scrollToId("top")} aria-label="Go to top">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button onClick={() => scrollToId("stays")}>Stays</button>
          <button onClick={() => scrollToId("management")}>Management</button>
          <button onClick={() => scrollToId("story")}>About Jami</button>
          <button onClick={() => scrollToId("reviews")}>Reviews</button>
          <button onClick={() => scrollToId("contact")}>Contact</button>
        </nav>

        <button className="nav-cta desktop-only" onClick={() => scrollToId("contact")}>
          Discuss your property <ArrowRight size={16} />
        </button>

        <button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
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
              ["story", "About Jami"],
              ["reviews", "Reviews"],
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
            <Waves size={17} /> North County Coastal short-term rental management
          </p>
          <h1>
            Local. Reliable.
            <span>Detail oriented.</span>
          </h1>
          <p className="hero-copy">
            Pacific Stay Properties pairs hands-on local property care with professional guest support,
            helping owners protect their homes, create 5-star experiences, and maximize returns.
          </p>
          <div className="hero-actions">
            <button className="button button-light" onClick={() => scrollToId("stays")}>
              Explore our stays <ArrowRight size={17} />
            </button>
            <button className="button button-ghost" onClick={() => scrollToId("contact")}>
              Discuss your property
            </button>
          </div>
        </div>

        <div className="hero-bottom shell">
          <span>{serviceAreas.join("  •  ")}</span>
          <button onClick={() => scrollToId("story")}>
            Meet Jami <ChevronDown size={17} />
          </button>
        </div>
      </section>

      <section className="intro-copy-section section-pad">
        <div className="shell intro-grid">
          <p className="eyebrow">Exceptional care. 5-star experiences. Maximum returns.</p>
          <div>
            <h2 className="display-heading">Hands-on support for the home. A seamless stay for the guest.</h2>
            <p className="lead-copy">
              Led by local Airbnb host and short-term rental manager Jami Jimenez, Pacific Stay Properties
              brings proactive communication, on-site assistance, and careful attention to the details that
              keep a vacation rental running smoothly.
            </p>
          </div>
        </div>
      </section>

      <section className="stays-section section-pad" id="stays">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Featured stay</p>
              <h2 className="display-heading">Your coast is calling.</h2>
            </div>
            <p className="section-side-copy">
              Explore Chestnut By the Sea, a real Pacific Stay-managed Carlsbad home just steps from the beach.
              Direct booking is the next system being connected to this property.
            </p>
          </div>

          <div className="stay-grid single-stay-grid">
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
                      <p className="location-line"><MapPin size={15} /> {stay.location}</p>
                      <h3>{stay.name}</h3>
                    </div>
                    <div className="mock-rate listing-rating">
                      <strong>{stay.rating} ★</strong>
                      <span>{stay.reviews} reviews</span>
                    </div>
                  </div>
                  <div className="stay-meta">
                    <span><Users size={17} /> {stay.guests} guests</span>
                    <span><BedDouble size={17} /> {stay.beds} beds</span>
                    <span><Home size={17} /> {stay.baths} baths</span>
                  </div>
                  <p>{stay.description}</p>
                  <div className="stay-card-actions">
                    <Link className="text-link" href={`/properties/${stay.slug}`}>
                      View property <ArrowRight size={16} />
                    </Link>
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
            <h2>5-star standards from arrival to checkout.</h2>
            <p>Prompt communication, seamless check-in and check-out, well-stocked essentials, and local support when a guest needs it.</p>
            <button className="button button-light" onClick={() => scrollToId("stays")}>
              Browse stays <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="path-card owner-path">
          <div className="path-shade" />
          <div className="path-content">
            <p className="eyebrow light-eyebrow">For homeowners</p>
            <h2>Your investment, locally supported.</h2>
            <p>Hands-on short-term rental management with calendar oversight, vendor coordination, property support, and regular owner updates.</p>
            <button className="button button-light" onClick={() => scrollToId("management")}>
              Explore management <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="management-section section-pad" id="management">
        <div className="shell">
          <div className="management-top">
            <div>
              <p className="eyebrow">Property management services</p>
              <h2 className="display-heading">The details are the service.</h2>
            </div>
            <p className="lead-copy compact-copy">
              Pacific Stay provides hands-on support designed to help owners maximize revenue while delivering exceptional guest experiences.
            </p>
          </div>

          <div className="service-grid expanded-service-grid">
            {services.map(({ icon: Icon, title, copy }, index) => (
              <div className="service-card" key={title}>
                <div className="service-card-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
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
              <p className="eyebrow">Local support, clear communication</p>
              <h3>Care that protects the property and the guest experience.</h3>
              <div className="steps-list">
                <div><span>01</span><div><strong>Protect the home</strong><p>Monthly safety checks, responsive on-site support, and trusted vendor coordination when property needs arise.</p></div></div>
                <div><span>02</span><div><strong>Optimize the operation</strong><p>Calendar monitoring, pricing adjustments, inventory oversight, and communication that keeps the stay running smoothly.</p></div></div>
                <div><span>03</span><div><strong>Keep owners informed</strong><p>Regular property updates so owners know what is happening with their investment without chasing answers.</p></div></div>
              </div>
              <button className="dark-link" onClick={() => scrollToId("contact")}>
                Talk with Jami <ArrowRight size={17} />
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
          <p>Exceptional care. 5-star experiences. Maximum returns.</p>
          <span>Pacific Stay Properties</span>
        </div>
      </section>

      <section className="story-section section-pad" id="story">
        <div className="shell jami-story-grid">
          <div className="jami-portrait-frame" aria-label="Portrait of Jami Jimenez">
            <div className="jami-portrait-placeholder"><span>JJ</span><small>Jami Jimenez</small></div>
          </div>

          <div className="story-copy jami-story-copy">
            <p className="eyebrow">About Jami</p>
            <h2 className="display-heading">Local. Reliable. Detail oriented.</h2>
            <p className="lead-copy">
              As a local Airbnb Host and Short-Term Rental Manager, Jami Jimenez provides hands-on support,
              proactive communication, and on-site assistance to help owners maximize revenue while delivering exceptional guest experiences.
            </p>
            <blockquote className="jami-quote">
              “My goal is simple: to protect your property and create exceptional guest experiences that lead to 5-star reviews and repeat bookings.”
            </blockquote>
            <div className="story-points">
              <span><Check size={16} /> Local Airbnb host</span>
              <span><Check size={16} /> Short-term rental manager</span>
              <span><Check size={16} /> Hands-on North County Coastal support</span>
            </div>
          </div>

          <aside className="service-area-panel">
            <p className="eyebrow">Serving North County Coastal</p>
            <h3>Close enough to show up.</h3>
            <p>Local availability is part of the Pacific Stay approach, with service across the coastal communities Jami knows and supports.</p>
            <div className="service-area-list">
              {serviceAreas.map((area) => <span key={area}><MapPin size={15} /> {area}</span>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="reviews-section section-pad" id="reviews">
        <div className="shell">
          <div className="reviews-heading">
            <div><p className="eyebrow">Client reviews</p><h2 className="display-heading">Care people notice.</h2></div>
            <p className="lead-copy compact-copy">
              Owners describe Jami&apos;s work in the same words Pacific Stay is built around: responsive, reliable, professional, and attentive to the details.
            </p>
          </div>

          <div className="reviews-grid">
            {testimonials.map((testimonial) => (
              <article className="review-card" key={testimonial.name}>
                <div className="review-stars" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={19} fill="currentColor" />)}
                </div>
                <blockquote>“{testimonial.quote}”</blockquote>
                <div className="review-author"><span>{testimonial.name}</span><small>Pacific Stay client review</small></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section personal-contact-section" id="contact">
        <div className="shell personal-contact-grid">
          <div className="contact-person-card">
            <div className="contact-photo-slot"><span>JJ</span></div>
            <div>
              <p className="eyebrow light-eyebrow">Your local contact</p>
              <h3>Jami Jimenez</h3>
              <p>Airbnb Host &amp; Short-Term Rental Manager</p>
            </div>
          </div>

          <div className="contact-main-copy">
            <p className="eyebrow light-eyebrow">Let&apos;s discuss your property</p>
            <h2>Local support starts with a conversation.</h2>
            <p>Serving Del Mar, La Jolla, Encinitas, Carlsbad, and Oceanside. Reach Jami directly to talk about your short-term rental.</p>
          </div>

          <div className="contact-detail-list">
            <a href="tel:+17604296633"><Phone size={19} /><span><small>Call Jami</small>760-429-6633</span></a>
            <a href="mailto:Jami.jimenez718@gmail.com"><Mail size={19} /><span><small>Email</small>Jami.jimenez718@gmail.com</span></a>
            <div><MapPin size={19} /><span><small>Service area</small>North County Coastal</span></div>
            <button className="button button-light" onClick={() => scrollToId("stays")}>
              Find a stay <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <div className="wordmark static-mark footer-wordmark"><span>PACIFIC STAY</span><small>PROPERTIES</small></div>
            <p>Local. Reliable. Detail oriented.</p>
          </div>
          <div>
            <span className="footer-label">Explore</span>
            <button onClick={() => scrollToId("stays")}>Stays</button>
            <button onClick={() => scrollToId("management")}>Management</button>
            <button onClick={() => scrollToId("story")}>About Jami</button>
            <button onClick={() => scrollToId("reviews")}>Reviews</button>
          </div>
          <div>
            <span className="footer-label">Connect</span>
            <a href="tel:+17604296633">760-429-6633</a>
            <a href="mailto:Jami.jimenez718@gmail.com">Email Jami</a>
            <a href="#contact">Property inquiry</a>
          </div>
          <div className="footer-note">
            <span>North County Coastal</span>
            <p>Del Mar • La Jolla • Encinitas • Carlsbad • Oceanside</p>
            <p>Pacific Stay Properties provides local short-term rental management and guest support across coastal North County.</p>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Pacific Stay Properties</span>
          <span>Exceptional care • 5-star experiences • Maximum returns</span>
        </div>
      </footer>
    </main>
  );
}
