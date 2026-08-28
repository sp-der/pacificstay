import type { Metadata } from "next";
import ReservationPortal from "./ReservationPortal";

export const metadata: Metadata = {
  title: "Your Reservation | Pacific Stay Properties",
  description: "Review your Pacific Stay direct reservation, payment status, and stay details.",
};

export default async function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReservationPortal reservationId={id} />;
}
