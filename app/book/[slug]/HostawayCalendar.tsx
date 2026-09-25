"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { HOSTAWAY_BOOKING_BASE_URL } from "../../../lib/hostaway";
import styles from "./book.module.css";

type HostawayCalendarOptions = {
  baseUrl: string;
  listingId: number;
  numberOfMonths: 1 | 2;
  openInNewTab: boolean;
  font: string;
  rounded: boolean;
  button: {
    action: "checkout" | "inquiry";
    text: string;
  };
  clearButtonText: string;
  color: {
    mainColor: string;
    frameColor: string;
    textColor: string;
  };
};

declare global {
  interface Window {
    hostawayCalendarWidget?: (options: HostawayCalendarOptions) => void;
  }
}

type Props = {
  listingId: number;
  propertyName: string;
};

export default function HostawayCalendar({ listingId, propertyName }: Props) {
  const [ready, setReady] = useState(false);

  const initialize = useCallback(() => {
    const container = document.getElementById("hostaway-calendar-widget");
    if (!container || !window.hostawayCalendarWidget) return;

    container.innerHTML = "";
    window.hostawayCalendarWidget({
      baseUrl: HOSTAWAY_BOOKING_BASE_URL,
      listingId,
      numberOfMonths: 2,
      openInNewTab: false,
      font: "Open Sans",
      rounded: true,
      button: {
        action: "checkout",
        text: "Book now",
      },
      clearButtonText: "Clear dates",
      color: {
        mainColor: "#315b5e",
        frameColor: "#173b3e",
        textColor: "#17221f",
      },
    });
    setReady(true);
  }, [listingId]);

  useEffect(() => {
    if (window.hostawayCalendarWidget) initialize();
  }, [initialize]);

  return (
    <div className={styles.hostawayCard}>
      <div className={styles.hostawayHeading}>
        <div>
          <p>Live Hostaway availability</p>
          <h3>Choose your dates</h3>
        </div>
        <span className={styles.hostawayLiveTag}>
          {ready ? <Check size={13} /> : <LoaderCircle size={13} className={styles.spin} />}
          {ready ? "Connected" : "Loading"}
        </span>
      </div>

      <p className={styles.hostawayIntro}>
        Live availability for {propertyName}. Select your dates below and continue directly to Hostaway checkout.
      </p>

      <div className={styles.hostawayWidgetShell}>
        {!ready && <div className={styles.hostawayLoading}>Loading live availability…</div>}
        <div id="hostaway-calendar-widget" />
      </div>

      <div className={styles.hostawaySecurity}>
        <ShieldCheck size={16} />
        <span>Availability, rates, taxes, fees, and secure checkout are handled by Pacific Stay&apos;s Hostaway booking system.</span>
      </div>

      <a
        className={styles.hostawayFallbackLink}
        href={`${HOSTAWAY_BOOKING_BASE_URL}listings/${listingId}`}
      >
        Open Beach Baby on Hostaway
      </a>

      <Script
        src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js"
        strategy="afterInteractive"
        onReady={initialize}
      />
    </div>
  );
}
