"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { HOSTAWAY_BOOKING_BASE_URL } from "../../../lib/hostaway";
import styles from "./book.module.css";

type HostawaySearchOptions = {
  baseUrl: string;
  showLocation: boolean;
  color: string;
  rounded: boolean;
  openInNewTab: boolean;
  font: string;
};

declare global {
  interface Window {
    searchBar?: (options: HostawaySearchOptions) => void;
  }
}

type Props = {
  propertyName: string;
};

export default function HostawaySearch({ propertyName }: Props) {
  const [ready, setReady] = useState(false);

  const initialize = useCallback(() => {
    const container = document.getElementById("hostaway-booking-widget");
    if (!container || !window.searchBar) return;

    container.innerHTML = "";
    window.searchBar({
      baseUrl: HOSTAWAY_BOOKING_BASE_URL,
      showLocation: false,
      color: "#315b5e",
      rounded: true,
      openInNewTab: false,
      font: "Open Sans",
    });
    setReady(true);
  }, []);

  useEffect(() => {
    if (window.searchBar) initialize();
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
        Search live availability for {propertyName}. Beach Baby is currently the property connected to Pacific Stay&apos;s Hostaway booking site.
      </p>

      <div className={styles.hostawaySearchShell}>
        {!ready && <div className={styles.hostawaySearchLoading}>Connecting to Hostaway…</div>}
        <div id="hostaway-booking-widget" />
      </div>

      <div className={styles.hostawaySecurity}>
        <ShieldCheck size={16} />
        <span>Dates and guest details are checked through Pacific Stay&apos;s published Hostaway booking engine before checkout.</span>
      </div>

      <Script
        src="https://d2q3n06xhbi0am.cloudfront.net/widget.js?1640277196"
        strategy="afterInteractive"
        onReady={initialize}
      />
    </div>
  );
}
