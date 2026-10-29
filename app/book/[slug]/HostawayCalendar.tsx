"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { HOSTAWAY_BOOKING_BASE_URL } from "../../../lib/hostaway";
import styles from "./book.module.css";

type HostawayCalendarOptions = {
  baseUrl: string;
  listingId: number;
  numberOfMonths: 1 | 2;
  openInNewTab: boolean;
  font: string;
  rounded: boolean;
  button: { action: "checkout" | "inquiry"; text: string };
  clearButtonText: string;
  color: { mainColor: string; frameColor: string; textColor: string };
};

declare global {
  interface Window {
    hostawayCalendarWidget?: (options: HostawayCalendarOptions) => void;
  }
}

type Props = { listingId: number; propertyName: string };

export default function HostawayCalendar({ listingId, propertyName }: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const observer = useRef<MutationObserver | null>(null);
  const widgetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookingLink = HOSTAWAY_BOOKING_BASE_URL + "listings/" + listingId;

  const initialize = useCallback(() => {
    const container = document.getElementById("hostaway-calendar-widget");
    if (!container || !window.hostawayCalendarWidget) return;

    observer.current?.disconnect();
    if (widgetTimeout.current) clearTimeout(widgetTimeout.current);
    container.replaceChildren();
    setStatus("loading");

    observer.current = new MutationObserver(() => {
      const message = (container.textContent ?? "").toLowerCase();
      if (/no booking engine found|booking engine not found|booking website not found/.test(message)) {
        setStatus("error");
      } else if (container.childElementCount > 0) {
        // This only confirms the widget rendered, not that a date is available.
        setStatus("ready");
      }
    });
    observer.current.observe(container, { childList: true, subtree: true, characterData: true });

    try {
      window.hostawayCalendarWidget({
        baseUrl: HOSTAWAY_BOOKING_BASE_URL,
        listingId,
        numberOfMonths: 2,
        openInNewTab: true,
        font: "Open Sans",
        rounded: true,
        button: { action: "checkout", text: "Continue to Hostaway checkout" },
        clearButtonText: "Clear dates",
        color: {
          mainColor: "#315b5e",
          frameColor: "#173b3e",
          textColor: "#17221f",
        },
      });
      widgetTimeout.current = setTimeout(() => {
        if (!container.childElementCount) setStatus("error");
      }, 10000);
    } catch {
      setStatus("error");
    }
  }, [listingId]);

  useEffect(() => {
    if (window.hostawayCalendarWidget) initialize();
    const timeout = setTimeout(() => {
      if (!window.hostawayCalendarWidget) setStatus("error");
    }, 12000);
    return () => {
      clearTimeout(timeout);
      observer.current?.disconnect();
      if (widgetTimeout.current) clearTimeout(widgetTimeout.current);
    };
  }, [initialize]);

  return (
    <div className={styles.hostawayCard}>
      <div className={styles.hostawayHeading}>
        <div>
          <p>Hosted by Hostaway</p>
          <h3>Choose your dates</h3>
        </div>
        <span className={styles.hostawayLiveTag}>
          {status === "loading" && <LoaderCircle size={13} className={styles.spin} />}
          {status === "ready" && <Check size={13} />}
          {status === "error" && <AlertCircle size={13} />}
          {status === "loading" ? "Loading" : status === "ready" ? "Widget loaded" : "Open Hostaway"}
        </span>
      </div>

      <p className={styles.hostawayIntro}>
        Check availability for {propertyName} with Hostaway. Choose your dates,
        then continue to its secure checkout in a new tab.
      </p>

      <div className={styles.hostawayWidgetShell}>
        {status === "loading" && <div className={styles.hostawayLoading}>Loading Hostaway calendar…</div>}
        <div id="hostaway-calendar-widget" />
        {status === "error" && (
          <p role="status">The embedded calendar could not load. You can still check dates on the verified Hostaway booking page below.</p>
        )}
      </div>

      <div className={styles.hostawaySecurity}>
        <ShieldCheck size={16} />
        <span>Availability, pricing, payments, and confirmation are provided by Hostaway.</span>
      </div>

      <a className={styles.hostawayFallbackLink} href={bookingLink} target="_blank" rel="noopener noreferrer">
        View {propertyName} directly on Hostaway
      </a>

      <Script
        src="https://d2q3n06xhbi0am.cloudfront.net/calendar.js"
        strategy="afterInteractive"
        onReady={initialize}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
