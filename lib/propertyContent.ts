import { Property } from '../app/properties/propertyData';
import { PhotoTourSection } from '../app/properties/photoTourData';
export type ManagedProperty = {
  id: string; slug: string; name: string; max_guests: number; min_nights: number; max_nights: number;
  base_nightly_rate: number | null; weekend_nightly_rate: number | null; cleaning_fee: number | null;
  tax_rate: number | null; content: Partial<Property> & { photoTour?: PhotoTourSection[]; cancellationPolicy?: string };
};
export const propertySelect = 'id,slug,name,max_guests,min_nights,max_nights,base_nightly_rate,weekend_nightly_rate,cleaning_fee,tax_rate,content';
export function mergeProperty(base: Property, row: ManagedProperty): Property & { photoTour?: PhotoTourSection[]; cancellationPolicy?: string } {
  return { ...base, ...row.content, slug: row.slug, name: row.name, guests: row.max_guests, minNights: row.min_nights };
}
