export type PhotoTourSection = {
  id: string;
  label: string;
  thumbnail: string;
  images: string[];
};

const chestnutAsset = (name: string) => `/chestnut/${name}`;

export const chestnutPreviewImages = [
  chestnutAsset("Exterior1.webp"),
  chestnutAsset("Exterior2.webp"),
  chestnutAsset("Exterior3.webp"),
  chestnutAsset("LivingRoom1.webp"),
];

export const chestnutPhotoTour: PhotoTourSection[] = [
  {
    id: "exterior",
    label: "Exterior",
    thumbnail: chestnutAsset("Exterior1.webp"),
    images: [
      chestnutAsset("Exterior1.webp"),
      chestnutAsset("Exterior2.webp"),
      chestnutAsset("Exterior3.webp"),
      chestnutAsset("Exterior4.webp"),
      chestnutAsset("Exterior (0).webp"),
      chestnutAsset("Exterior (1).webp"),
      chestnutAsset("Exterior (2)-1.webp"),
      chestnutAsset("Exterior (2).webp"),
      chestnutAsset("Exterior (3).webp"),
      chestnutAsset("Exterior (4).webp"),
      chestnutAsset("Exterior (5).webp"),
      chestnutAsset("Exterior (6).webp"),
      chestnutAsset("Exterior (7).webp"),
      chestnutAsset("Exterior (8).webp"),
      chestnutAsset("Exterior (9).webp"),
    ],
  },
  {
    id: "living-room",
    label: "Living Room",
    thumbnail: chestnutAsset("LivingRoom1.webp"),
    images: [
      chestnutAsset("LivingRoom1.webp"),
      chestnutAsset("LivingRoom (1).webp"),
      chestnutAsset("LivingRoom (2).webp"),
      chestnutAsset("LivingRoom (3).webp"),
    ],
  },
  {
    id: "full-kitchen",
    label: "Full Kitchen",
    thumbnail: chestnutAsset("FullKitchen (1).webp"),
    images: [
      chestnutAsset("FullKitchen (1).webp"),
      chestnutAsset("FullKitchen (1)_1.webp"),
      chestnutAsset("FullKitchen (2).webp"),
      chestnutAsset("FullKitchen (3).webp"),
      chestnutAsset("FullKitchen (4).webp"),
      chestnutAsset("FullKitchen (5).webp"),
      chestnutAsset("FullKitchen (6).webp"),
      chestnutAsset("FullKitchen (7).webp"),
      chestnutAsset("FullKitchen (8).webp"),
      chestnutAsset("FullKitchen (9).webp"),
    ],
  },
  {
    id: "dining-area",
    label: "Dining Area",
    thumbnail: chestnutAsset("DiningArea.webp"),
    images: [chestnutAsset("DiningArea.webp")],
  },
  {
    id: "primary-bedroom",
    label: "Primary Bedroom",
    thumbnail: chestnutAsset("MasterBed (1).webp"),
    images: [
      chestnutAsset("MasterBed (1).webp"),
      chestnutAsset("MasterBed (2).webp"),
    ],
  },
  {
    id: "bedroom-2",
    label: "Bedroom 2",
    thumbnail: chestnutAsset("Bedroom2 (1).webp"),
    images: [
      chestnutAsset("Bedroom2 (1).webp"),
      chestnutAsset("Bedroom2 (2).webp"),
      chestnutAsset("Bedroom2 (3).webp"),
    ],
  },
  {
    id: "bedroom-3",
    label: "Bedroom 3",
    thumbnail: chestnutAsset("Bedroom3 (1).webp"),
    images: [
      chestnutAsset("Bedroom3 (1).webp"),
      chestnutAsset("Bedroom3 (2).webp"),
    ],
  },
  {
    id: "full-bathroom-1",
    label: "Full Bathroom 1",
    thumbnail: chestnutAsset("FullBathroom1.webp"),
    images: [chestnutAsset("FullBathroom1.webp")],
  },
  {
    id: "full-bathroom-2",
    label: "Full Bathroom 2",
    thumbnail: chestnutAsset("FullBathroom2.webp"),
    images: [chestnutAsset("FullBathroom2.webp")],
  },
  {
    id: "downstairs-living",
    label: "Downstairs Living",
    thumbnail: chestnutAsset("DownstairsLiving.webp"),
    images: [chestnutAsset("DownstairsLiving.webp")],
  },
  {
    id: "downstairs-kitchenette",
    label: "Downstairs Kitchenette",
    thumbnail: chestnutAsset("Kitchenette.webp"),
    images: [chestnutAsset("Kitchenette.webp")],
  },
  {
    id: "additional-photos",
    label: "Additional Photos",
    thumbnail: chestnutAsset("Extra (1).webp"),
    images: [
      chestnutAsset("Extra (1).webp"),
      chestnutAsset("Extra (2).webp"),
      chestnutAsset("Extra (3).webp"),
    ],
  },
];

export function getPhotoTour(slug: string) {
  if (slug === "chestnut-by-the-sea") return chestnutPhotoTour;
  return null;
}
