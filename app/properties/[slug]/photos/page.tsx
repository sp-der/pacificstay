import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PhotoTour from "./PhotoTour";
import { getProperty, properties } from "../../propertyData";
import { getPhotoTour } from "../../photoTourData";

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  return {
    title: property
      ? `Photo Tour | ${property.name} | Pacific Stay Properties`
      : "Photo Tour | Pacific Stay Properties",
    description: property
      ? `Explore every room and outdoor space at ${property.name}.`
      : "Pacific Stay property photo tour.",
  };
}

export default async function PropertyPhotosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  const sections = getPhotoTour(slug);

  if (!property || !sections) notFound();

  return (
    <main className="photo-tour-page">
      <header className="photo-tour-header">
        <Link href={`/properties/${slug}`} className="photo-tour-back">
          <ArrowLeft size={18} /> Back to {property.name}
        </Link>
        <Link href="/" className="photo-tour-wordmark" aria-label="Pacific Stay Properties home">
          <span>PACIFIC STAY</span>
          <small>PROPERTIES</small>
        </Link>
        <span className="photo-tour-header-spacer" />
      </header>

      <div className="photo-tour-shell">
        <PhotoTour propertyName={property.name} sections={sections} />
      </div>
    </main>
  );
}
