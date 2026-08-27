import type { Metadata } from "next";
import "./globals.css";
import "./details.css";
import "./readability.css";
import "./property.css";
import "./jami-photo.css";
import "./production.css";
import "./gallery-viewer.css";
import "./photo-tour.css";
import "./site-fixes.css";
import "./official-brand.css";
import PropertyImageViewer from "./PropertyImageViewer";
import SiteFixes from "./SiteFixes";

export const metadata: Metadata = {
  title: "Pacific Stay Properties | North County Coastal Rentals & Management",
  description:
    "Pacific Stay Properties provides short-term rental property management and coastal guest stays across Del Mar, La Jolla, Encinitas, Carlsbad, and Oceanside.",
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
        <SiteFixes />
        {children}
      </body>
    </html>
  );
}
