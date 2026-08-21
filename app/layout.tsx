import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pacific Stay Properties | Coastal Short-Term Rentals",
  description:
    "A coastal short-term rental and property management experience by Pacific Stay Properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
