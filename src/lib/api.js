import { getYoutubeEmbedUrl } from "./utils";

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
    videoFilePath: "/videos/property.mp4",
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
  const media = [];

  if (p.is_file) {
    if (p.image) {
      media.push({ type: 'image', path: p.image, isPrimary: true });
    }
    return {
        ...p,
        media,
        image: p.image, // Keep for compatibility
    };
  }

  // Handle images
  const imagesForProperty = [];
  if (p.image) {
    imagesForProperty.push(p.image);
  } else {
    imagesForProperty.push(ALL_PUBLIC_IMAGES[index % ALL_PUBLIC_IMAGES.length]);
  }

  const startIndex = index % ALL_PUBLIC_IMAGES.length;
  for (let i = 0; imagesForProperty.length < 5 && i < ALL_PUBLIC_IMAGES.length; i++) {
    const imgIndex = (startIndex + i) % ALL_PUBLIC_IMAGES.length;
    const img = ALL_PUBLIC_IMAGES[imgIndex];
    if (!imagesForProperty.includes(img)) {
      imagesForProperty.push(img);
    }
  }

  imagesForProperty.forEach((imgPath, idx) => {
      media.push({
          type: 'image',
          path: imgPath,
          isPrimary: idx === 0
      })
  })

  // Handle video
  if (p.youtubeEmbedLink) {
      media.push({
          type: 'video',
          video_embed_link: getYoutubeEmbedUrl(p.youtubeEmbedLink)
      })
  } else if (p.videoFilePath) {
      media.push({
          type: 'video',
          path: p.videoFilePath
      })
  }

  const newP = { ...p };
  delete newP.image;
  delete newP.images;
  delete newP.youtubeEmbedLink;
  delete newP.videoFilePath;

  return {
    ...newP,
    media: media,
    // For backward compatibility for components that just need one primary image
    image: media.find(m => m.type === 'image' && m.isPrimary)?.path
  };
});


const rawMapsData = [
  {
    title: "Phase 8 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE_8_Map.pdf",
    description: "Detailed layout of DHA Phase 8, highlighting residential and commercial areas.",
    city: "Lahore",
    societyName: "DHA",
    phase: "Phase 8",
  },
  {
    title: "Phase 9 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "mapsMedia/PHASE 9.pdf",
    description: "Comprehensive map of DHA Phase 9, including new developments and key facilities.",
    city: "Lahore",
    societyName: "DHA",
    phase: "Phase 9",
  },
  {
    title: "Phase 1 TO 5 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "mapsMedia/PHASE 1 TO 5.pdf",
    description: "Overview map covering DHA Phases 1 to 5, showing established communities and infrastructure.",
    city: "Lahore",
    societyName: "DHA",
    phase: "Phase 1-5",
  },

  {
    title: "Phase 6 & 7 Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/PHASE 6+7.pdf",
    description: "Combined map for DHA Phases 6 and 7, indicating property divisions and amenities.",
    city: "Lahore",
    societyName: "DHA",
    phase: "Phase 6-7",
  },
  {
    title: "9 Town Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/9 TOWN.pdf",
    description: "Detailed map of 9 Town, showcasing its urban planning and property distribution.",
    city: "Lahore",
    societyName: "9 Town",
    phase: "N/A",
  },

  {
    title: "IVY GREEN Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "mapsMedia/IVY GREEN.pdf",
    description: "Exclusive map of IVY GREEN, highlighting its green spaces and residential plots.",
    city: "Lahore",
    societyName: "IVY GREEN",
    phase: "N/A",
  },
  {
    title: "DHA COMMERCIAL Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/DHA COMMERCIAL.pdf",
    description: "Map focused on DHA's commercial zones, ideal for business and investment.",
    city: "Lahore",
    societyName: "DHA",
    phase: "Commercial",
  },
  {
    title: "DHA BHAWALPUR",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/DHA BHAWALPUR.pdf",
    description: "Layout of DHA Bahawalpur, detailing residential blocks and public facilities.",
    city: "Bahawalpur",
    societyName: "DHA",
    phase: "N/A",
  },

  {
    title: "DHA GUJRANWALA",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/DHA GUJRANWALA.pdf",
    description: "Master plan of DHA Gujranwala, including sector divisions and development projects.",
    city: "Gujranwala",
    societyName: "DHA",
    phase: "N/A",
  },
  {
    title: "DHA MULTAN Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/DHA MULTAN.pdf",
    description: "Detailed map of DHA Multan, showcasing its modern infrastructure and diverse property options.",
    city: "Multan",
    societyName: "DHA",
    phase: "Multan",
  },
  {
    title: "DHA PESHAWER Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/DHA PESHAWER.pdf",
    description: "Layout of DHA Peshawar, highlighting key residential and commercial zones.",
    city: "Peshawar",
    societyName: "DHA",
    phase: "N/A",
  },
  {
    title: "DHA QUETTA Map",
    thumb: "/mapsMedia/thumbs/PHASE_8_Map.webp",
    pdfPath: "/mapsMedia/DHA QUETTA.pdf",
    description: "Comprehensive map of DHA Quetta, showing its planned development and strategic locations.",
    city: "Quetta",
    societyName: "DHA",
    phase: "N/A",
  },
];

const rawCategoryCardData = [
  {
    title: "House",
    count: 120,
    src: "/images/house-1867187_1280.jpg",
    filePath: null,
  },
  {
    title: "Apartment",
    count: 80,
    src: "/images/apartments-1845884_1280.jpg",
    filePath: null,
    titleClassName: "text-white",
  },
  {
    title: "Villa",
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
    title: "Plot",
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

export const fetchProperties = async (filters = {}) => {
  await sleep(200); // Simulate network delay
  let filteredProperties = propertyCardVariants.filter(p => p.category !== "File" && !p.is_file);

  const { category, city, beds, baths, area, areaUnit, query, priceType, property_type, societyName, phase } = filters;

  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    filteredProperties = filteredProperties.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerCaseQuery) ||
        p.shortDescription.toLowerCase().includes(lowerCaseQuery) ||
        p.city.toLowerCase().includes(lowerCaseQuery) ||
        p.location.toLowerCase().includes(lowerCaseQuery) ||
        (p.societyName && p.societyName.toLowerCase().includes(lowerCaseQuery)) ||
        (p.phase && p.phase.toLowerCase().includes(lowerCaseQuery)) ||
        p.badges.some(badge => badge.label.toLowerCase().includes(lowerCaseQuery))
    );
  }

  if (category) {
    filteredProperties = filteredProperties.filter(p => p.category === category);
  }
  if (city) {
    filteredProperties = filteredProperties.filter(p => p.city === city);
  }
  if (beds) {
    filteredProperties = filteredProperties.filter(p => p.beds >= parseInt(beds, 10));
  }
  if (baths) {
    filteredProperties = filteredProperties.filter(p => p.baths >= parseInt(baths, 10));
  }
  if (area) {
    const targetArea = parseInt(area, 10);
    filteredProperties = filteredProperties.filter(p => {
      // Assuming all property areas are in sqft for comparison or need conversion
      // For simplicity, directly compare if units match or perform a basic conversion if needed.
      // Here, we'll assume a direct numerical comparison.
      if (p.areaUnit === areaUnit || !areaUnit) { // If units match or no unit specified, compare directly
        return p.area === targetArea;
      } else if (areaUnit === "sq yards" && p.areaUnit === "sqft") {
        // Convert p.area (sqft) to sq yards for comparison
        return Math.round(p.area / 9) === targetArea;
      } else if (areaUnit === "sqft" && p.areaUnit === "sq yards") {
        // Convert p.area (sq yards) to sqft for comparison
        return Math.round(p.area * 9) === targetArea;
      }
      return false; // Mismatched units without conversion logic
    });
  }
  if (priceType) {
    filteredProperties = filteredProperties.filter(p => p.priceType === priceType);
  }
  if (property_type) {
    filteredProperties = filteredProperties.filter(p => p.property_type === property_type);
  }
  if (societyName) {
    filteredProperties = filteredProperties.filter(p => p.societyName === societyName);
  }
  if (phase) {
    filteredProperties = filteredProperties.filter(p => p.phase === phase);
  }

  return filteredProperties;
};

export const fetchFilterOptions = async () => {
  await sleep(100); // Simulate network delay for filter options

  const allProperties = propertyCardVariants.filter(p => p.category !== "File" && !p.is_file);

  const categories = [...new Set(allProperties.map(p => p.category))];
  const cities = [...new Set(allProperties.map(p => p.city))];
  // Assuming badges can act as 'labels' for filtering
  const labels = [...new Set(allProperties.flatMap(p => p.badges ? p.badges.map(b => b.label) : []))];
  // Assuming 'phase' can be a filter
  const phases = [...new Set(allProperties.map(p => p.phase).filter(Boolean))]; // Filter out undefined/null
  const propertyTypes = [...new Set(allProperties.map(p => p.property_type).filter(Boolean))];
  const priceTypes = [...new Set(allProperties.map(p => p.priceType).filter(Boolean))];
  const societyNames = [...new Set(allProperties.map(p => p.societyName).filter(Boolean))];


  // For beds, baths, area, we might want ranges or min/max, but for now, just unique values or max values
  const maxBeds = Math.max(...allProperties.map(p => p.beds || 0));
  const maxBaths = Math.max(...allProperties.map(p => p.baths || 0));


  return {
    categories,
    cities,
    labels,
    phases,
    propertyTypes,
    priceTypes,
    maxBeds,
    maxBaths,
    societyNames,
  };
};

export const fetchProperty = async (id) => {
  await sleep(200);
  const property = propertyCardVariants.find((p) => p.id === id);
  if (!property) {
    throw new Error("Property not found");
  }
  return property;
}

export const fetchMaps = async (filters = {}) => {
  await sleep(200);
  let filteredMaps = mapsData;

  const { query, city, societyName, phase } = filters;

  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    filteredMaps = filteredMaps.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerCaseQuery) ||
        m.description.toLowerCase().includes(lowerCaseQuery) ||
        (m.city && m.city.toLowerCase().includes(lowerCaseQuery)) ||
        (m.societyName && m.societyName.toLowerCase().includes(lowerCaseQuery)) ||
        (m.phase && m.phase.toLowerCase().includes(lowerCaseQuery))
    );
  }

  if (city) {
    filteredMaps = filteredMaps.filter(m => m.city === city);
  }
  if (societyName) {
    filteredMaps = filteredMaps.filter(m => m.societyName === societyName);
  }
  if (phase) {
    filteredMaps = filteredMaps.filter(m => m.phase === phase);
  }

  return filteredMaps;
};

export const fetchMapFilterOptions = async () => {
  await sleep(100);

  const cities = [...new Set(mapsData.map(m => m.city).filter(Boolean))];
  const societyNames = [...new Set(mapsData.map(m => m.societyName).filter(Boolean))];
  const phases = [...new Set(mapsData.map(m => m.phase).filter(Boolean))];

  return {
    cities,
    societyNames,
    phases,
  };
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

export const fetchFileProperties = async (filters = {}) => {
  await sleep(200);
  let filteredFiles = propertyCardVariants.filter(p => p.category === "File");

  const { city, societyName, phase, file_type, area, areaUnit, query } = filters;

  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    filteredFiles = filteredFiles.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerCaseQuery) ||
        (p.societyName && p.societyName.toLowerCase().includes(lowerCaseQuery)) ||
        (p.phase && p.phase.toLowerCase().includes(lowerCaseQuery)) ||
        (p.file_type && p.file_type.toLowerCase().includes(lowerCaseQuery)) ||
        (p.city && p.city.toLowerCase().includes(lowerCaseQuery)) ||
        (p.location && p.location.toLowerCase().includes(lowerCaseQuery)) ||
        (p.badges && p.badges.some(badge => badge.label.toLowerCase().includes(lowerCaseQuery)))
    );
  }

  if (city) {
    filteredFiles = filteredFiles.filter(p => p.city === city);
  }
  if (societyName) {
    filteredFiles = filteredFiles.filter(p => p.societyName === societyName);
  }
  if (phase) {
    filteredFiles = filteredFiles.filter(p => p.phase === phase);
  }
  if (file_type) {
    filteredFiles = filteredFiles.filter(p => p.file_type === file_type);
  }
  if (area) {
    const targetArea = parseInt(area, 10);
    filteredFiles = filteredFiles.filter(p => {
      if (p.areaUnit === areaUnit || !areaUnit) {
        return p.area === targetArea;
      } else if (areaUnit === "sq yards" && p.areaUnit === "sqft") {
        return Math.round(p.area / 9) === targetArea;
      } else if (areaUnit === "sqft" && p.areaUnit === "sq yards") {
        return Math.round(p.area * 9) === targetArea;
      }
      return false;
    });
  }

  return filteredFiles;
}

export const fetchFileFilterOptions = async () => {
  await sleep(100);

  const allFiles = propertyCardVariants.filter(p => p.category === "File");

  const cities = [...new Set(allFiles.map(p => p.city).filter(Boolean))];
  const societyNames = [...new Set(allFiles.map(p => p.societyName).filter(Boolean))];
  const phases = [...new Set(allFiles.map(p => p.phase).filter(Boolean))];
  const fileTypes = [...new Set(allFiles.map(p => p.file_type).filter(Boolean))];

  const maxArea = Math.max(...allFiles.map(p => p.area || 0));

  return {
    cities,
    societyNames,
    phases,
    fileTypes,
    maxArea,
  };
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
        videoSection: {
            isVisible: true,
            heading: 'Featured Video',
            subheading: 'Watch our latest property showcase.',
            videoInputMethod: 'upload',
            videoMedia: [{ type: 'video', path: '/videos/property.mp4' }],
            videoEmbedLink: '',
        }
    }
}
        
        export const fetchGlobalSearch = async (query) => {
          await sleep(200); // Simulate network delay
          if (!query) {
            return { properties: [], files: [], maps: [], categories: [], cities: [], societies: [], phases: [], labels: [], propertyTypes: [], priceTypes: [], fileTypes: [] };
          }
        
          const lowerCaseQuery = query.toLowerCase();
        
          const [properties, files, maps, filterOptions, mapFilterOptions, fileFilterOptions, allCategories] = await Promise.all([
            fetchProperties({ query }),
            fetchFileProperties({ query }),
            fetchMaps({ query }),
            fetchFilterOptions(),
            fetchMapFilterOptions(),
            fetchFileFilterOptions(),
            fetchCategories()
          ]);
          
          const categories = allCategories.filter(c => c.title.toLowerCase().includes(lowerCaseQuery));
        
          // Combine and deduplicate filter options
          const allCities = [...new Set([...filterOptions.cities, ...mapFilterOptions.cities, ...fileFilterOptions.cities])];
          const cities = allCities.filter(c => c.toLowerCase().includes(lowerCaseQuery));
          
          const allSocieties = [...new Set([...filterOptions.societyNames, ...mapFilterOptions.societyNames, ...fileFilterOptions.societyNames])];
          const societies = allSocieties.filter(s => s.toLowerCase().includes(lowerCaseQuery));
        
          const allPhases = [...new Set([...filterOptions.phases, ...mapFilterOptions.phases, ...fileFilterOptions.phases])];
          const phases = allPhases.filter(p => p.toLowerCase().includes(lowerCaseQuery));
          
          const labels = filterOptions.labels.filter(l => l.toLowerCase().includes(lowerCaseQuery));
          const propertyTypes = filterOptions.propertyTypes.filter(pt => pt.toLowerCase().includes(lowerCaseQuery));
          const priceTypes = filterOptions.priceTypes.filter(pt => pt.toLowerCase().includes(lowerCaseQuery));
          const fileTypes = fileFilterOptions.fileTypes.filter(ft => ft.toLowerCase().includes(lowerCaseQuery));
        
          return {
            properties,
            files,
            maps,
            categories,
            cities,
            societies,
            phases,
            labels,
            propertyTypes,
            priceTypes,
            fileTypes
          };
        };
        