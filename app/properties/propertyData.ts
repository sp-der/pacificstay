import { chestnutPreviewImages } from "./photoTourData";

export type PropertyAmenityGroup = {
  title: string;
  items: string[];
};

export type SleepingSpace = {
  room: string;
  bed: string;
  note: string;
};

export type ReviewScore = {
  label: string;
  score: string;
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
  minNights: number;
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
  airbnbUrl: string;
  rating: string;
  reviewCount: number;
  guestFavorite: boolean;
  reviewScores: ReviewScore[];
};

export const properties: Property[] = [
  {
    slug: "chestnut-by-the-sea",
    name: "Chestnut By the Sea",
    location: "Carlsbad, California",
    area: "Carlsbad Village • North County Coastal",
    tag: "Luxury Bali-inspired beach retreat",
    heroImage: chestnutPreviewImages[0],
    gallery: chestnutPreviewImages.slice(1),
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 2,
    minNights: 5,
    propertyType: "Entire home",
    summary:
      "A luxury Bali-inspired Carlsbad escape just steps from the beach, with a private outdoor setup made for slow mornings, sunset drinks, and relaxed coastal evenings.",
    description: [
      "Chestnut By the Sea was designed as a polished coastal oasis by designer Shirley Slee. The home pairs warm, Bali-inspired details with the easy pace of Carlsbad living, placing guests close to the beach and the heart of the Village.",
      "Guests can take the beach cruisers toward downtown, unwind in the outdoor jacuzzi, rinse off in the outdoor shower, gather around the fire pit, cook on the BBQ, or settle in with a drink at the home's secret bar. The outdoor entertainment patio and swings make the space especially well suited for families and small groups.",
    ],
    highlights: [
      "Steps from Carlsbad State Beach",
      "Jacuzzi, fire pit, outdoor shower & BBQ patio",
      "Beach cruisers for exploring Carlsbad Village",
      "Walkable access to restaurants, wine tasting rooms, shops and the coast",
      "Guest favorite with a 4.88 rating",
      "Locally supported by Jami Jimenez",
    ],
    amenities: [
      {
        title: "Beach & outdoor living",
        items: [
          "Beach access",
          "Outdoor jacuzzi",
          "Outdoor shower",
          "Fire pit",
          "BBQ area",
          "Outdoor entertainment patio",
          "Outdoor swings",
          "Beach cruisers",
        ],
      },
      {
        title: "Kitchen & work",
        items: [
          "Full kitchen",
          "Well-equipped cookware",
          "Drip coffee maker",
          "Dedicated workspace",
          "Dining and gathering space",
        ],
      },
      {
        title: "Guest essentials",
        items: [
          "Wi-Fi",
          "Free parking on premises",
          "Keypad self check-in",
          "Room-darkening shades",
          "Extra bedding",
          "Smoke alarm",
          "Carbon monoxide alarm",
        ],
      },
      {
        title: "Experience",
        items: [
          "Secret bar",
          "Family-friendly setup",
          "Comfortable beds",
          "Walkable Carlsbad Village location",
          "Responsive local hosting support",
        ],
      },
    ],
    sleeping: [
      { room: "Bedroom 1", bed: "1 king bed", note: "Upstairs primary bedroom" },
      { room: "Bedroom 2", bed: "2 single beds", note: "Flexible sleeping setup for guests" },
      { room: "Bedroom 3", bed: "1 bed", note: "Additional private bedroom" },
    ],
    checkIn: "After 4:00 PM",
    checkOut: "Before 11:00 AM",
    parking: "Free parking on premises",
    wifi: "Wi-Fi included",
    access: "Self check-in with keypad",
    houseRules: [
      "Maximum of 6 guests",
      "No pets",
      "Minimum stay of 5 nights",
      "Bookings may be requested up to 12 months in advance",
      "Check-in after 4:00 PM",
      "Checkout before 11:00 AM",
      "Cancellation terms are shown during booking based on the selected stay dates",
    ],
    safety: [
      "Exterior security cameras on the property",
      "Carbon monoxide alarm",
      "Smoke alarm",
    ],
    locationCopy:
      "Chestnut By the Sea is in Carlsbad, California, near Carlsbad State Beach and Carlsbad Village. The beach is only a short walk away, while restaurants, wine tasting rooms, shopping, and other Village favorites are within an easy walk. The neighborhood is known for its scenic coastal setting and walkability.",
    airbnbUrl: "https://www.airbnb.com/h/chestnutbytheseav2",
    rating: "4.88",
    reviewCount: 24,
    guestFavorite: true,
    reviewScores: [
      { label: "Cleanliness", score: "4.8" },
      { label: "Accuracy", score: "4.8" },
      { label: "Check-in", score: "5.0" },
      { label: "Communication", score: "4.9" },
      { label: "Location", score: "5.0" },
      { label: "Value", score: "4.8" },
    ],
  },
];

export function getProperty(slug: string) {
  return properties.find((property) => property.slug === slug);
}
