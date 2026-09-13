import { Property } from '../app/properties/propertyData';
import { PhotoTourSection } from '../app/properties/photoTourData';
export type ManagedProperty = {
  id: string; slug: string; name: string; active: boolean; max_guests: number; min_nights: number; max_nights: number;
  base_nightly_rate: number | null; weekend_nightly_rate: number | null; cleaning_fee: number | null;
  tax_rate: number | null; content: Partial<Property> & { photoTour?: PhotoTourSection[]; cancellationPolicy?: string };
};
export const propertySelect = 'id,slug,name,active,max_guests,min_nights,max_nights,base_nightly_rate,weekend_nightly_rate,cleaning_fee,tax_rate,content';

function propertyDefaults(row: ManagedProperty): Property {
  return {
    slug: row.slug,
    name: row.name,
    location: '',
    area: '',
    tag: '',
    heroImage: '',
    gallery: [],
    guests: row.max_guests,
    bedrooms: 0,
    beds: 0,
    baths: 0,
    minNights: row.min_nights,
    propertyType: 'Entire home',
    summary: '',
    description: [],
    highlights: [],
    amenities: [],
    sleeping: [],
    checkIn: '',
    checkOut: '',
    parking: '',
    wifi: '',
    access: '',
    houseRules: [],
    safety: [],
    locationCopy: '',
    airbnbUrl: '',
    rating: '',
    reviewCount: 0,
    guestFavorite: false,
    reviewScores: [],
  };
}

export function mergeProperty(base: Property | undefined, row: ManagedProperty): Property & { photoTour?: PhotoTourSection[]; cancellationPolicy?: string } {
  return { ...propertyDefaults(row), ...(base ?? {}), ...row.content, slug: row.slug, name: row.name, guests: row.max_guests, minNights: row.min_nights };
}
