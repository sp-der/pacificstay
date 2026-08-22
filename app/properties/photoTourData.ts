export type PhotoTourSection = {
  id: string;
  label: string;
  thumbnail: string;
  images: string[];
};

const LISTING_ID = "1553757930360534380";
const airbnbPhoto = (id: string) =>
  `https://a0.muscache.com/im/pictures/hosting/Hosting-${LISTING_ID}/original/${id}.jpeg?im_w=1440`;

// These five are the current Airbnb gallery assets corresponding to the
// client-selected named photos in the uploaded archive.
const exterior1 = airbnbPhoto("5c5954bb-afdb-4cdc-aa69-11f27d3d1f0e");
const exterior2 = airbnbPhoto("dfd49318-26cc-4801-98bf-578c8dc5801e");
const exterior3 = airbnbPhoto("f3d84380-5aaa-40a1-b5ed-d84eed5d2277");
const exterior4 = airbnbPhoto("35d0dde6-5ffb-47cf-8546-a0aeebfff5d6");
const livingRoom1 = airbnbPhoto("3af56cb1-4b75-4e69-97d8-2be50f8cb93b");

export const chestnutPreviewImages = [
  exterior1,
  exterior2,
  exterior3,
  livingRoom1,
];

export const chestnutPhotoTour: PhotoTourSection[] = [
  {
    id: "exterior",
    label: "Exterior",
    thumbnail: exterior1,
    images: [
      exterior1,
      exterior2,
      exterior3,
      exterior4,
      airbnbPhoto("3afab2e1-49d3-4ce4-b377-ebe80fba7b87"),
      airbnbPhoto("42148d2b-4fc0-46b2-abe8-5f904fe7623e"),
      airbnbPhoto("48f8be94-49ed-43f5-b594-ff27988e5006"),
      airbnbPhoto("6ac425ed-92d2-405a-8c1d-5e7f2bdc16a6"),
      airbnbPhoto("78071962-462c-422f-ac75-9bbcbb76999c"),
      airbnbPhoto("8769786e-2270-4152-841b-c47fe6fb3f31"),
      airbnbPhoto("a31a3d04-d57b-488a-a362-befbd3fbf7e9"),
      airbnbPhoto("b0d0f25f-9917-49b9-9708-e97cf214fc43"),
      airbnbPhoto("b8217ba0-1709-47e7-8ea9-393238b9ab8b"),
      airbnbPhoto("c6e0de2c-1395-4a40-8952-5918878aaba1"),
      airbnbPhoto("ef968f23-ee8d-42e4-bc5e-b9829d77ffad"),
    ],
  },
  {
    id: "living-room",
    label: "Living Room",
    thumbnail: livingRoom1,
    images: [
      livingRoom1,
      airbnbPhoto("11c9cf95-cfee-4810-bcc0-fb363c8cd977"),
      airbnbPhoto("1663093c-3c2e-44ff-9a21-4090d79f7e81"),
      airbnbPhoto("e53bcf67-b682-4197-9b55-10c852b69cc2"),
    ],
  },
  {
    id: "full-kitchen",
    label: "Full Kitchen",
    thumbnail: airbnbPhoto("150d13fc-794c-4b74-9c72-0663d20a7354"),
    images: [
      airbnbPhoto("150d13fc-794c-4b74-9c72-0663d20a7354"),
      airbnbPhoto("4f387424-aeef-421c-8252-fbcb348462a5"),
      airbnbPhoto("527816a6-6e0c-4a2c-bd1d-17fa0556e49f"),
      airbnbPhoto("5f0baadb-a006-4a42-8c8d-e6bfb651afa2"),
      airbnbPhoto("76ca1b1c-c1d9-4eaa-8886-3b2092730c9e"),
      airbnbPhoto("886964cd-a680-4d35-a07e-d91520146eb8"),
      airbnbPhoto("8b5c467a-33e4-44e9-a422-f1bfdc318ee1"),
      airbnbPhoto("b35615e9-d776-4fc1-bc34-1b398f1149dc"),
      airbnbPhoto("e99d2308-422a-4628-9f71-4e71ec2aca51"),
      airbnbPhoto("ec1e9bfd-6f01-4dbb-83a3-89830cae5320"),
    ],
  },
  {
    id: "dining-area",
    label: "Dining Area",
    thumbnail: airbnbPhoto("1ae605af-6d77-4a6d-970e-18f55b19908a"),
    images: [airbnbPhoto("1ae605af-6d77-4a6d-970e-18f55b19908a")],
  },
  {
    id: "primary-bedroom",
    label: "Primary Bedroom",
    thumbnail: airbnbPhoto("42dbfae3-a03d-419e-98ea-d5b65bfcc1f9"),
    images: [
      airbnbPhoto("42dbfae3-a03d-419e-98ea-d5b65bfcc1f9"),
      airbnbPhoto("b2198dfc-715e-40ee-a871-819c46820150"),
    ],
  },
  {
    id: "bedroom-2",
    label: "Bedroom 2",
    thumbnail: airbnbPhoto("125f084c-a979-4ef6-9faa-3251c1d2df27"),
    images: [
      airbnbPhoto("125f084c-a979-4ef6-9faa-3251c1d2df27"),
      airbnbPhoto("d6b12bf8-361a-4dc6-aa42-d882f82b7d6c"),
      airbnbPhoto("eaffaf5a-866d-461b-86d3-f816867534d8"),
    ],
  },
  {
    id: "bedroom-3",
    label: "Bedroom 3",
    thumbnail: airbnbPhoto("d339fc93-efbf-4f6e-8a44-26ebae0da738"),
    images: [
      airbnbPhoto("d339fc93-efbf-4f6e-8a44-26ebae0da738"),
      airbnbPhoto("ee9fa804-aa1b-4297-92bc-f2f9447da414"),
    ],
  },
  {
    id: "full-bathroom-1",
    label: "Full Bathroom 1",
    thumbnail: airbnbPhoto("c93c6326-ecb2-4cbc-808a-46e57d680cf0"),
    images: [airbnbPhoto("c93c6326-ecb2-4cbc-808a-46e57d680cf0")],
  },
  {
    id: "full-bathroom-2",
    label: "Full Bathroom 2",
    thumbnail: airbnbPhoto("10c336da-6df0-47a6-b856-243a077e0b8b"),
    images: [airbnbPhoto("10c336da-6df0-47a6-b856-243a077e0b8b")],
  },
  {
    id: "downstairs-living",
    label: "Downstairs Living",
    thumbnail: airbnbPhoto("d92283f9-21ba-4041-bbc6-60143cbbb865"),
    images: [airbnbPhoto("d92283f9-21ba-4041-bbc6-60143cbbb865")],
  },
  {
    id: "downstairs-kitchenette",
    label: "Downstairs Kitchenette",
    thumbnail: airbnbPhoto("158b8856-25f8-40c2-840f-cca8b242f38e"),
    images: [airbnbPhoto("158b8856-25f8-40c2-840f-cca8b242f38e")],
  },
  {
    id: "additional-photos",
    label: "Additional Photos",
    thumbnail: airbnbPhoto("33a76452-abd1-4ab8-b52d-e37d2755a8c9"),
    images: [
      airbnbPhoto("33a76452-abd1-4ab8-b52d-e37d2755a8c9"),
      airbnbPhoto("3fe4728f-3353-4fca-a0a2-29689ed87e5a"),
      airbnbPhoto("856d9856-8728-49e6-9128-a39fbb1e7918"),
    ],
  },
];

export function getPhotoTour(slug: string) {
  if (slug === "chestnut-by-the-sea") return chestnutPhotoTour;
  return null;
}
