export type PropertyAmenityGroup = {
  title: string;
  items: string[];
};

export type SleepingSpace = {
  room: string;
  bed: string;
  note: string;
};

export type Property = {
  slug: string;
  name: string;
  location: string;
  area: string;
  tag: string;
  heroImage: string;
  gallery: string[];
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  price: number;
  propertyType: string;
  summary: string;
  description: string[];
  highlights: string[];
  amenities: PropertyAmenityGroup[];
  sleeping: SleepingSpace[];
  checkIn: string;
  checkOut: string;
  parking: string;
  wifi: string;
  access: string;
  houseRules: string[];
  safety: string[];
  locationCopy: string;
};

export const properties: Property[] = [
  {
    slug: "pacific-house",
    name: "The Pacific House",
    location: "Del Mar, California",
    area: "North County Coastal",
    tag: "Ocean-view escape",
    heroImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=88",
    ],
    guests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 3,
    price: 495,
    propertyType: "Entire coastal home",
    summary:
      "A sun-washed coastal home designed around open gathering spaces, slow mornings, and easy access to the North County coast.",
    description: [
      "The Pacific House is a presentation listing created to show how a Pacific Stay direct-booking property can feel online. The layout is intentionally rich enough to demonstrate the complete guest journey while the client gathers the real home details.",
      "For the final listing, this space can hold the property story, neighborhood advantages, special design details, recent upgrades, and the small touches that make the home memorable to guests.",
    ],
    highlights: [
      "Bright indoor-outdoor living",
      "Dedicated spaces for groups and families",
      "Locally managed guest support",
      "Stocked essentials for an easy arrival",
    ],
    amenities: [
      {
        title: "Guest essentials",
        items: ["High-speed Wi-Fi", "Central heating & air", "Fresh linens", "Bath essentials", "Hair dryer", "Iron & ironing board"],
      },
      {
        title: "Kitchen & dining",
        items: ["Full kitchen", "Cookware & utensils", "Coffee setup", "Dishwasher", "Refrigerator", "Indoor dining area"],
      },
      {
        title: "Home & entertainment",
        items: ["Smart TV", "Washer & dryer", "Dedicated workspace", "Family gathering area", "Closet storage", "Private entrance"],
      },
      {
        title: "Outdoor & access",
        items: ["Outdoor seating", "Patio space", "On-site parking", "Self check-in", "Exterior lighting", "Local support when needed"],
      },
    ],
    sleeping: [
      { room: "Primary bedroom", bed: "1 king bed", note: "Private primary sleeping space" },
      { room: "Bedroom two", bed: "1 queen bed", note: "Comfortable guest room" },
      { room: "Bedroom three", bed: "1 queen bed", note: "Comfortable guest room" },
      { room: "Bedroom four", bed: "1 full bed", note: "Additional private sleeping space" },
    ],
    checkIn: "4:00 PM",
    checkOut: "10:00 AM",
    parking: "On-site parking shown as a sample amenity",
    wifi: "High-speed Wi-Fi shown as a sample amenity",
    access: "Self check-in details are provided before arrival",
    houseRules: [
      "No smoking inside the home",
      "No parties or unregistered events",
      "Respect neighborhood quiet hours",
      "Only registered guests may stay overnight",
      "Final pet policy will be confirmed with the real listing",
    ],
    safety: [
      "Smoke detectors",
      "Carbon monoxide detectors",
      "Exterior lighting",
      "Emergency contact support",
    ],
    locationCopy:
      "Presented as a Del Mar stay for this mockup, the final page can include beach access, nearby dining, shopping, freeway access, local landmarks, and drive times once the actual property address and listing information are provided.",
  },
  {
    slug: "salt-sand-retreat",
    name: "Salt + Sand Retreat",
    location: "Encinitas, California",
    area: "North County Coastal",
    tag: "Steps from the coast",
    heroImage:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=88",
    ],
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 2,
    price: 365,
    propertyType: "Entire coastal retreat",
    summary:
      "An airy, design-forward coastal retreat with warm natural textures and the essentials for a polished North County weekend.",
    description: [
      "Salt + Sand Retreat is a second presentation listing built to demonstrate how Pacific Stay can showcase a smaller short-term rental with the same level of care and direct-booking detail.",
      "The finished version can be customized around the real home's personality, including its best amenities, favorite local stops, beach access, family features, work-from-home setup, and any special guest perks.",
    ],
    highlights: [
      "Relaxed coastal interiors",
      "Comfortable setup for up to six guests",
      "Simple self check-in experience",
      "Hands-on Pacific Stay local support",
    ],
    amenities: [
      {
        title: "Guest essentials",
        items: ["High-speed Wi-Fi", "Heating & air", "Fresh linens", "Bath essentials", "Hair dryer", "Extra pillows & blankets"],
      },
      {
        title: "Kitchen & dining",
        items: ["Full kitchen", "Cookware & utensils", "Coffee setup", "Microwave", "Refrigerator", "Dining area"],
      },
      {
        title: "Home & entertainment",
        items: ["Smart TV", "Washer & dryer", "Workspace", "Living room", "Closet storage", "Private entrance"],
      },
      {
        title: "Outdoor & access",
        items: ["Outdoor seating", "Patio or balcony", "On-site parking", "Self check-in", "Exterior lighting", "Local property support"],
      },
    ],
    sleeping: [
      { room: "Primary bedroom", bed: "1 king bed", note: "Private primary sleeping space" },
      { room: "Bedroom two", bed: "1 queen bed", note: "Comfortable guest room" },
      { room: "Bedroom three", bed: "1 queen bed", note: "Comfortable guest room" },
    ],
    checkIn: "4:00 PM",
    checkOut: "10:00 AM",
    parking: "On-site parking shown as a sample amenity",
    wifi: "High-speed Wi-Fi shown as a sample amenity",
    access: "Self check-in details are provided before arrival",
    houseRules: [
      "No smoking inside the home",
      "No parties or unregistered events",
      "Respect neighborhood quiet hours",
      "Only registered guests may stay overnight",
      "Final pet policy will be confirmed with the real listing",
    ],
    safety: [
      "Smoke detectors",
      "Carbon monoxide detectors",
      "Exterior lighting",
      "Emergency contact support",
    ],
    locationCopy:
      "Presented as an Encinitas stay for this mockup, the finished listing can call out nearby beaches, coffee shops, restaurants, shopping, surf spots, local attractions, and drive times once the actual property information is available.",
  },
];

export function getProperty(slug: string) {
  return properties.find((property) => property.slug === slug);
}
