import type { Metadata } from "next";
import "./globals.css";
import "./details.css";
import "./readability.css";
import "./property.css";
import "./jami-photo.css";
import "./production.css";
import "./gallery-viewer.css";
import "./photo-tour.css";
import "./official-brand.css";
import "./home-polish.css";
import "./property-motion.css";
import PropertyImageViewer from "./PropertyImageViewer";
import HomeMotion from "./HomeMotion";

export const metadata: Metadata = {
  metadataBase: new URL("https://pacificstayproperties.com"),
  title: "Short-Term Rental Property Management | Pacific Stay Properties",
  description:
    "Pacific Stay Properties offers full-service short-term rental, Airbnb and vacation rental management in North County San Diego, from staging to guest care.",
  openGraph: {
    type: "website",
    siteName: "Pacific Stay Properties",
    title: "Short-Term Rental Property Management | Pacific Stay Properties",
    description: "Full-service Airbnb and vacation rental management in North County San Diego, including setup, pricing, guest support, cleaning and upkeep.",
    url: "https://pacificstayproperties.com",
    locale: "en_US",
  },
  icons: {
    icon: "/PSP.png",
    shortcut: "/PSP.png",
    apple: "/PSP.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PropertyImageViewer />
        <HomeMotion />
        {children}
      </body>
    </html>
  );
}
