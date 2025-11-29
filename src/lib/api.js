// To simulate a real API, we'll use a short delay.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const rawPropertyCardVariants = [
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
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-9635eaea2667",
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
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-9635eaea2667",
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
    src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    filePath: "/mapsMedia/PHASE_8_Map.pdf",
  },
  {
    title: "Apartments",
    count: 80,
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    filePath: null,
  },
  {
    title: "Villas",
    count: 45,
    src: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
    filePath: null,
  },
  {
    title: "Commercial",
    count: 60,
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    filePath: null,
  },
  {
    title: "Plots",
    count: 70,
    src: "https://images.unsplash.com/photo-1509315811345-67de0a30c7b4",
    filePath: null,
  },
  {
    title: "Land Files",
    count: 30,
    src: "https://images.unsplash.com/photo-1583522265352-c8402e82f8fd",
    filePath: null,
  },
];

const rawPersonalizedCardsData = [
  {
    title: "Looking for the new home?",
    description:
      "10 new offers every day. 350 offers on site, trusted by a community of thousands of users.",
    buttonText: "Get Started",
    buttonLink: "/properties", // Example link
    imagePath: "/house1.svg",
    backgroundColor: "bg-[var(--tea-green)]",
  },
  {
    title: "Want to sell your home?",
    description:
      "10 new offers every day. 350 offers on site, trusted by a community of thousands of users.",
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
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    text: "The team was incredibly supportive, guiding me through every step of the process. I found my dream home faster than I ever thought possible. Their local knowledge is unmatched.",
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    role: "Property Investor",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    text: "As an investor, I need reliable data and quick turnarounds. This platform provided both. The discounted property alerts are a game-changer for my portfolio.",
  },
  {
    id: 3,
    name: "Fatima Ali",
    role: "Renting a New Apartment",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    text: "Finding a furnished apartment for rent was a breeze. The listings were detailed and accurate, which saved me a lot of time. Highly recommended for anyone new to the city.",
  },
  {
    id: 4,
    name: "Hassan Mirza",
    role: "Selling a Commercial Plot",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    text: "Their marketing strategy for my commercial plot was brilliant. We had multiple offers within a week. Professional, efficient, and results-driven.",
  },
];

// Add unique IDs to the data, just like a real backend would provide
export const propertyCardVariants = rawPropertyCardVariants.map((p, index) => ({
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