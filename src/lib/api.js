// To simulate a real API, we'll use a short delay.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ALL_PUBLIC_IMAGES = [
  '/images/apartments-1845884_1280.jpg',
  '/images/architecture-5999913_1280.jpg',
  '/images/business-7111770_1280.jpg',
  '/images/condominium-6377942_1280.jpg',
  '/images/field-7808525_1280.jpg',
  '/images/house-1353389_1280.jpg',
  '/images/house-1867187_1280.jpg',
  '/images/newport-1184695_1280.jpg',
  '/images/purchase-3113198_1280.jpg',
  '/images/real-estate-3337038_1280.jpg',
  '/images/real-estate-6688945_1280.jpg',
];

const initialRawPropertyCardVariants = [
  {
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    title: "Student Hostel Room",
    price: 15000,
    priceType: "rent",
    currency: "Rs",
    location: "Near University",
    city: "Peshawar",
    beds: 1,
    baths: 1,
    area: 200,
    areaUnit: "sqft",
    category: "Hostel",
    societyName: "University Town",
    phase: "N/A",
    is_furnished: true,
    property_type: "Residential",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "New", variant: "new" },
    ],
    shortDescription:
      "Affordable and comfortable student hostel room located conveniently near the university campus.",
    detailedDescription:
      "This cozy hostel room is perfect for students seeking a secure and conducive living environment close to their educational institution. It comes fully furnished with a bed, study desk, and wardrobe. Residents have access to shared common areas including a study lounge, cafeteria, and laundry facilities. The hostel provides 24/7 security and high-speed internet, ensuring a hassle-free student life.",
    features: [
      "Fully Furnished Room",
      "Near University Campus",
      "Shared Study Lounge",
      "Cafeteria Access",
      "Laundry Facilities",
      "24/7 Security",
      "High-Speed Internet",
    ],
    youtubeEmbedLink:
      "https://www.youtube.com/embed/IiZdOrUKr9k?si=GFOdumGqMiQllvO1", // Example link
  },
  {
    image: "/images/house-1867187_1280.jpg",
    title: "Luxury Apartment with Amenities",
    price: 180000,
    priceType: "rent",
    currency: "Rs",
    location: "E-11",
    city: "Islamabad",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 2,
    area: 1800,
    areaUnit: "sqft",
    category: "Apartment",
    societyName: "Islamabad Apartments",
    phase: "E-11",
    is_furnished: true,
    property_type: "Residential",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "Swimming Pool", variant: "featured" },
      { label: "Gym", variant: "default" },
    ],
    shortDescription:
      "A stunning 3-bedroom apartment offering breathtaking views and world-class amenities in the heart of Islamabad.",
    detailedDescription:
      "This luxurious apartment in the prestigious E-11 sector is designed for comfort and style. It features a spacious living area, modern kitchen with high-end appliances, and large balconies. Residents have exclusive access to a swimming pool, a fully-equipped gym, and dedicated parking. The building is secured with 24/7 surveillance and is conveniently located near top schools, shopping centers, and restaurants, making it an ideal home for families and professionals.",
    features: [
      "3 Spacious Bedrooms",
      "Modern Kitchen",
      "Swimming Pool Access",
      "Fully-Equipped Gym",
      "24/7 Security",
      "Dedicated Parking",
      "Close to Amenities",
    ],
    youtubeEmbedLink:
      "https://www.youtube.com/embed/IiZdOrUKr9k?si=GFOdumGqMiQllvO1", // Example link
  },
  {
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    title: "Commercial Shop in Mall",
    price: 8000000,
    priceType: "sale",
    is_discounted: true,
    originalPrice: 9000000,
    currency: "Rs",
    location: "Dolmen Mall",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 800,
    areaUnit: "sqft",
    category: "Commercial",
    societyName: "Dolmen Mall",
    phase: "N/A",
    is_furnished: false,
    property_type: "Commercial",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "New", variant: "new" },
    ],
    shortDescription:
      "A prime commercial shop in the bustling Dolmen Mall, ideal for retail businesses seeking high foot traffic.",
    detailedDescription:
      "This 800 sqft commercial shop is strategically located on the ground floor of Dolmen Mall, one of Karachi's most popular shopping destinations. It offers excellent visibility and accessibility, perfect for attracting a large customer base. The mall provides ample parking, 24/7 security, and a vibrant shopping environment. This is a rare opportunity to establish your brand in a premium commercial space.",
    features: [
      "Prime Mall Location",
      "High Foot Traffic",
      "800 sqft Area",
      "24/7 Security",
      "Ample Parking",
      "Modern Infrastructure",
      "Ideal for Retail",
    ],
    youtubeEmbedLink:
      "https://www.youtube.com/embed/IiZdOrUKr9k?si=GFOdumGqMiQllvO1", // Example link
  },
  {
    image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e",
    title: "Beach Front Property",
    price: 75000000,
    priceType: "sale",
    is_discounted: true,
    originalPrice: 85000000,
    currency: "Rs",
    location: "Sea View",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 5,
    baths: 4,
    area: 5000,
    areaUnit: "sqft",
    category: "Villa",
    societyName: "Sea View Properties",
    phase: "N/A",
    is_furnished: false,
    property_type: "Residential",
    badges: [
      { label: "Sale", variant: "sale" },
      { label: "Hot", variant: "hot" },
      { label: "Featured", variant: "featured" },
    ],
    shortDescription:
      "An exquisite beachfront villa with unobstructed ocean views, offering a serene and luxurious lifestyle.",
    detailedDescription:
      "Wake up to the sound of waves in this magnificent 5-bedroom villa located on the prime Sea View beach. This property boasts a private garden, a large terrace perfect for entertaining, and direct access to the beach. The interior is designed with a modern aesthetic, featuring high ceilings, large windows for natural light, and premium fittings. It's a perfect sanctuary for those seeking a tranquil escape from the city, while still being close to Karachi's finest dining and entertainment spots.",
    features: [
      "5 Bedrooms with Ocean View",
      "Private Garden & Terrace",
      "Direct Beach Access",
      "Modern Interior Design",
      "High-End Kitchen",
      "Gated Community",
      "Prime Location",
    ],
    youtubeEmbedLink:
      "https://www.youtube.com/embed/IiZdOrUKr9k?si=GFOdumGqMiQllvO1", // Example link
  },
  {
    image: "/images/architecture-5999913_1280.jpg",
    title: "6-Month Installment Plan",
    price: 75000,
    priceType: "installment",
    currency: "Rs",
    installmentPeriod: "6-month",
    installmentDuration: "24 installments",
    location: "Model Town",
    city: "Lahore",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 2,
    area: 1500,
    areaUnit: "sqft",
    category: "House",
    societyName: "Model Town Society",
    phase: "N/A",
    is_furnished: true,
    property_type: "Residential",
    badges: [{ label: "New", variant: "new" }],
    shortDescription:
      "A comfortable house available on an easy 6-month installment plan in Model Town, Lahore.",
    detailedDescription:
      "Secure your dream home with a flexible 6-month installment plan! This beautiful 3-bedroom, 2-bath house in Model Town, Lahore, offers 1500 sqft of living space. It features a modern design, a spacious kitchen, and a private garden. Model Town is a highly sought-after area known for its peaceful environment, lush parks, and proximity to schools, hospitals, and commercial centers. This is an excellent opportunity for families looking for an affordable and convenient way to own a home.",
    features: [
      "3 Bedrooms",
      "2 Bathrooms",
      "1500 sqft Area",
      "6-Month Installment Plan",
      "Modern Design",
      "Private Garden",
      "Prime Location in Model Town",
    ],
    youtubeEmbedLink:
      "https://www.youtube.com/embed/IiZdOrUKr9k?si=GFOdumGqMiQllvO1", // Example link
  },
  {
    title: "Affidavit File DHA Phase 7",
    is_file: true,
    file_type: "Affidavit",
    price: 5000000,
    is_discounted: true,
    originalPrice: 5500000,
    currency: "Rs",
    area: 250,
    areaUnit: "sq yards",
    city: "Lahore",
    category: "File",
    property_type: "New Booking",
    societyName: "DHA",
    is_furnished: false,
  },
  {
    title: "Allocation Letter Bahria Town",
    is_file: true,
    file_type: "Allocation",
    price: 3500000,
    currency: "Rs",
    area: 250,
    areaUnit: "sq yards",
    location: "Bahria Town, Karachi",
    city: "Karachi",
    category: "File",
    property_type: "New Booking",
    societyName: "Bahria Town",
    phase: "N/A",
    is_furnished: false,
  },
  {
    title: "Affidavit File Paragon City",
    is_file: true,
    file_type: "Affidavit",
    price: 2000000,
    currency: "Rs",
    area: 125,
    areaUnit: "sq yards",
    location: "Paragon City, Lahore",
    city: "Lahore",
    category: "File",
    property_type: "New Booking",
    societyName: "Paragon City",
    phase: "N/A",
    is_furnished: false,
  },
  {
    title: "Allocation Letter DHA Multan",
    is_file: true,
    file_type: "Allocation",
    price: 4000000,
    currency: "Rs",
    area: 500,
    areaUnit: "sq yards",
    location: "DHA Multan, Multan",
    city: "Multan",
    category: "File",
    property_type: "New Booking",
    societyName: "DHA",
    phase: "Multan",
    is_furnished: false,
  },
];

const enrichedRawPropertyCardVariants = initialRawPropertyCardVariants.map((p, index) => {
  if (p.is_file) {
    return p;
  }

  const imagesForProperty = [];
  // Add the main image first
  if (p.image) {
    imagesForProperty.push(p.image);
  } else {
    // Fallback if no main image, use a public image
    imagesForProperty.push(ALL_PUBLIC_IMAGES[index % ALL_PUBLIC_IMAGES.length]);
  }

  // Add a few more unique images from ALL_PUBLIC_IMAGES
  // Use a simple selection logic based on index to make it varied but deterministic
  const startIndex = index % ALL_PUBLIC_IMAGES.length;
  for (let i = 0; imagesForProperty.length < 5 && i < ALL_PUBLIC_IMAGES.length; i++) {
    const imgIndex = (startIndex + i) % ALL_PUBLIC_IMAGES.length;
    const img = ALL_PUBLIC_IMAGES[imgIndex];
    if (!imagesForProperty.includes(img)) {
      imagesForProperty.push(img);
    }
  }

  // If still less than 5, fill with any available images (should not happen if ALL_PUBLIC_IMAGES is large enough)
  while (imagesForProperty.length < 5 && ALL_PUBLIC_IMAGES.length > 0) {
    const randomImg = ALL_PUBLIC_IMAGES[Math.floor(Math.random() * ALL_PUBLIC_IMAGES.length)];
    if (!imagesForProperty.includes(randomImg)) {
      imagesForProperty.push(randomImg);
    }
  }

  return {
    ...p,
    images: imagesForProperty,
  };
});


const rawMapsData = [
  {
    title: "Phase 8 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 7 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 6 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 5 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 6 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
  {
    title: "Phase 7 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Description and metadata about this map.",
  },
];

const rawCategoryCardData = [
  {
    title: "Houses",
    count: 120,
    src: "/images/house-1867187_1280.jpg",
    filePath: null,
  },
  {
    title: "Apartments",
    count: 80,
    src: "/images/apartments-1845884_1280.jpg",
    filePath: null,
    titleClassName: "text-white",
  },
  {
    title: "Villas",
    count: 45,
    src: "/images/newport-1184695_1280.jpg",
    filePath: null,
  },
  {
    title: "Commercial",
    count: 60,
    src: "/images/condominium-6377942_1280.jpg",
    filePath: null,
  },
  {
    title: "Plots",
    count: 70,
    src: "/images/field-7808525_1280.jpg",
    filePath: null,
  },
];

const rawPersonalizedCardsData = [
  {
    title: "Looking for the new home?",
    description:
      "Discover your ideal property from a wide selection of homes available for sale or rent. New listings added daily!",
    buttonText: "Get Started",
    buttonLink: "/properties", // Example link
    imagePath: "/house1.svg",
    backgroundColor: "bg-[var(--tea-green)]",
  },
  {
    title: "Want to sell your home?",
    description:
      "List your property with us and connect with thousands of potential buyers. Get the best value for your home with our expert guidance.",
    buttonText: "Get Started",
    buttonLink: "/contact", // Example link
    imagePath: "/house2.svg",
    backgroundColor: "bg-[var(--ash-grey)]",
  },
];

const rawReviewsData = [
  {
    id: 1,
    name: "Aisha Khan",
    role: "First-time Homebuyer",
    avatar: null,
    text: "The team was incredibly supportive, guiding me through every step of the process. I found my dream home faster than I ever thought possible. Their local knowledge is unmatched.",
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    role: "Property Investor",
    avatar: null,
    text: "As an investor, I need reliable data and quick turnarounds. This platform provided both. The discounted property alerts are a game-changer for my portfolio.",
  },
  {
    id: 3,
    name: "Fatima Ali",
    role: "Renting a New Apartment",
    avatar: null,
    text: "Finding a furnished apartment for rent was a breeze. The listings were detailed and accurate, which saved me a lot of time. Highly recommended for anyone new to the city.",
  },
  {
    id: 4,
    name: "Hassan Mirza",
    role: "Selling a Commercial Plot",
    avatar: null,
    text: "Their marketing strategy for my commercial plot was brilliant. We had multiple offers within a week. Professional, efficient, and results-driven.",
  },
];

// Add unique IDs to the data, just like a real backend would provide
export const propertyCardVariants = enrichedRawPropertyCardVariants.map((p, index) => ({
  ...p,
  id: `${p.title.toLowerCase().replace(/\s+/g, "-")}-${index}`,
}));

export const mapsData = rawMapsData.map((m, index) => ({
  ...m,
  id: `${m.title.toLowerCase().replace(/\s+/g, "-")}-${index}`,
}));

export const categoryCardData = rawCategoryCardData.map((c, index) => ({
  ...c,
  id: `${c.title.toLowerCase().replace(/\s+/g, "-")}-${index}`,
}));

export const reviewsData = rawReviewsData.map((r, index) => ({
  ...r,
  id: `${r.name.toLowerCase().replace(/\s+/g, "-")}-${index}`,
}));

export const personalizedCardsData = rawPersonalizedCardsData;

// --- API Functions ---

export const fetchProperties = async () => {
  await sleep(200); // Simulate network delay
  return propertyCardVariants.filter(p => p.category !== "File" && !p.is_file);
};

export const fetchProperty = async (id) => {
  await sleep(200);
  const property = propertyCardVariants.find((p) => p.id === id);
  if (!property) {
    throw new Error("Property not found");
  }
  return property;
};

export const fetchMaps = async () => {
  await sleep(200);
  return mapsData;
};

export const fetchCategories = async () => {
  await sleep(200);
  return categoryCardData;
};

export const fetchPersonalizedCards = async () => {
  await sleep(200);
  return personalizedCardsData;
};

export const fetchReviews = async () => {
  await sleep(200);
  return reviewsData;
}

export const fetchFileProperties = async () => {
  await sleep(200);
  return propertyCardVariants.filter(p => p.category === "File");
}

export const fetchHomeData = async () => {
    await sleep(300);
    const [properties, maps, categories, personalizedCards, reviews, fileProperties] = await Promise.all([
        fetchProperties(),
        fetchMaps(),
        fetchCategories(),
        fetchPersonalizedCards(),
        fetchReviews(),
        fetchFileProperties(),
    ]);
    return {
        properties: properties.slice(0, 4), // Return only 4 properties for the homepage slider
        maps: maps.slice(0, 4), // Return only 4 maps for the homepage slider
        categories,
        personalizedCards,
        reviews,
        fileProperties: fileProperties.slice(0, 3), // Return only 3 file properties for the homepage grid
    }
}