import { getEmbedUrl, getYoutubeEmbedUrl } from "./utils";

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
  if (newP.locationMap) {
      newP.locationMap = getYoutubeEmbedUrl(newP.locationMap);
  }
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

const transformProperty = (p) => {
  // Normalize media if it's the object structure from the real API
  let normalizedMedia = [];
  if (p.media && !Array.isArray(p.media)) {
    if (p.media.thumbnail_image) {
      normalizedMedia.push({ 
        ...p.media.thumbnail_image, 
        type: 'image', 
        isPrimary: true 
      });
    }
    if (Array.isArray(p.media.gallery_images)) {
      p.media.gallery_images.forEach(img => normalizedMedia.push({ 
        ...img, 
        type: 'image', 
        isPrimary: false 
      }));
    }
    if (p.media.video) {
      normalizedMedia.push({ 
        ...p.media.video, 
        type: 'video',
        video_embed_link: p.media.video.video_embed_link ? getEmbedUrl(p.media.video.video_embed_link) : null
      });
    }
  } else if (Array.isArray(p.media)) {
    normalizedMedia = p.media;
  }

  const primaryImage = normalizedMedia.find(m => m.type === 'image' && m.isPrimary) || normalizedMedia.find(m => m.type === 'image');

  return {
    ...p,
    id: String(p.id),
    media: normalizedMedia,
    image: primaryImage?.path || null,
    imageThumb: primaryImage?.thumb_path || null,
    price: p.price_amount,
    originalPrice: p.price_original_amount,
    currency: "Rs",
    location: p.address,
    city: p.city_name,
    societyName: p.society_name,
    phase: p.phase_name,
    areaUnit: p.unit,
    priceType: p.purchase_type,
    shortDescription: p.short_desc,
    detailedDescription: p.detailed_description_content,
    locationMap: p.embed_link ? getEmbedUrl(p.embed_link) : null,
    installment_advance_amount: p.installment_advance_amount,
    installment_amount: p.installment_amount,
    installment_total_period_text: p.installment_total_period_text,
    installment_display_mode: p.installment_display_mode,
    price_period_unit: p.price_period_unit,
    badges: (p.labels || []).map(l => ({
      label: l.name,
      variant: l.badge_variant || "secondary",
      is_badge: !!l.is_badge
    })),
    features: typeof p.features === 'string' ? p.features.split(',').map(f => f.trim()).filter(Boolean) : (Array.isArray(p.features) ? p.features.map(f => f.value || f) : []),
  };
};

export const fetchProperties = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.query) params.append('query', filters.query);
  if (filters.category) params.append('category', filters.category);
  if (filters.city) params.append('city', filters.city);
  if (filters.beds) params.append('beds', filters.beds);
  if (filters.baths) params.append('baths', filters.baths);
  if (filters.property_type) params.append('property_type', filters.property_type);
  if (filters.priceType) params.append('priceType', filters.priceType);
  if (filters.societyName) params.append('societyName', filters.societyName);
  if (filters.phase) params.append('phase', filters.phase);
  if (filters.area) params.append('area', filters.area);
  if (filters.areaUnit) params.append('areaUnit', filters.areaUnit);
  if (filters.is_file !== undefined) params.append('is_file', filters.is_file ? '1' : '0');
  else params.append('is_file', '0'); // Default to properties

  const response = await fetch(`/api/properties?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch properties');
  const data = await response.json();
  
  return data.map(transformProperty);
};

export const fetchFilterOptions = async () => {
  const [categoriesRes, citiesRes, societiesRes, phasesRes, labelsRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/cities'),
    fetch('/api/societies'),
    fetch('/api/phases'),
    fetch('/api/labels'),
  ]);

  const [categories, cities, societies, phases, labels] = await Promise.all([
    categoriesRes.json(),
    citiesRes.json(),
    societiesRes.json(),
    phasesRes.json(),
    labelsRes.json(),
  ]);

  return {
    categories: categories.map(c => c.name),
    cities: cities.map(c => c.name),
    societyNames: societies.map(s => s.name),
    phases: phases.map(p => p.name),
    labels: labels.filter(l => l.is_filter).map(l => l.name), // Only include labels marked as filters
    propertyTypes: ["Residential", "Commercial"],
    priceTypes: ["sale", "rent", "installment"],
    maxBeds: 10,
    maxBaths: 10,
  };
};

export const fetchProperty = async (id) => {
  const response = await fetch(`/api/properties/${id}`);
  if (!response.ok) throw new Error('Property not found');
  const data = await response.json();
  return transformProperty(data);
}

export const fetchMaps = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.query) params.append('query', filters.query);
  if (filters.city) params.append('city', filters.city);
  if (filters.societyName) params.append('societyName', filters.societyName);
  if (filters.phase) params.append('phase', filters.phase);

  const response = await fetch(`/api/maps?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch maps');
  const data = await response.json();
  return data.map(m => ({
    ...m,
    id: String(m.id),
    image: m.map_pic,
    thumb: m.map_thumb,
    pdfPath: m.pdf,
    societyName: m.society_name,
    cityName: m.city_name,
    phaseName: m.phase_name
  }));
};

export const fetchMapFilterOptions = async () => {
  const [citiesRes, societiesRes, phasesRes] = await Promise.all([
    fetch('/api/cities'),
    fetch('/api/societies'),
    fetch('/api/phases'),
  ]);

  const [cities, societies, phases] = await Promise.all([
    citiesRes.json(),
    societiesRes.json(),
    phasesRes.json(),
  ]);

  return {
    cities: cities.map(c => c.name),
    societyNames: societies.map(s => s.name),
    phases: phases.map(p => p.name),
  };
};

export const fetchCategories = async () => {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data.map(c => ({
    ...c,
    id: String(c.id),
    title: c.name,
    src: c.pic,
    thumb: c.thumb,
    count: c.properties_count || 0
  }));
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
  return fetchProperties({ ...filters, is_file: true });
}

export const fetchFileFilterOptions = async () => {
  const options = await fetchFilterOptions();
  return {
    ...options,
    fileTypes: ["Allocation", "Affidavit"],
    maxArea: 10000,
  };
}

export const fetchLandingSections = async (token) => {
    try {
        const response = await fetch('/api/landing-sections', {
            headers: token ? { 
              'Authorization': `Bearer ${token}`,
              'X-Auth-Token': token
            } : {}
        });
        if (!response.ok) throw new Error('Failed to fetch landing sections');
        return await response.json();
    } catch (error) {
        console.error('Error fetching landing sections:', error);
        return [];
    }
};

export const fetchLandingAvailableItems = async (token) => {
    const response = await fetch('/api/landing-available-items', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Auth-Token': token
        }
    });
    if (!response.ok) throw new Error('Failed to fetch available items');
    return await response.json();
};

export const fetchItemsByIds = async (collectionType, ids) => {
    if (!ids || ids.length === 0) return [];
    
    try {
        let combined = [];
        if (collectionType === 'properties') {
            const all = await fetchProperties();
            const allFiles = await fetchFileProperties();
            combined = [...all, ...allFiles];
        } else if (collectionType === 'categories') {
            combined = await fetchCategories();
        } else if (collectionType === 'maps') {
            combined = await fetchMaps();
        }

        // Create a map for O(1) lookup
        const itemsMap = new Map();
        combined.forEach(item => {
            // Store by string ID for consistent matching
            itemsMap.set(String(item.id), item);
        });

        // Map the IDs back to items in the SPECIFIC ORDER requested
        let items = ids.map(id => itemsMap.get(String(id))).filter(Boolean);
        
        return items;
    } catch (error) {
        console.error(`Error fetching items for ${collectionType}:`, error);
        return [];
    }
};

export const fetchHomeData = async () => {
    // Fetch landing sections from backend
    const sections = await fetchLandingSections();
    
    // Fetch other static mock data for now
    const [personalizedCards, reviews, allFileProperties] = await Promise.all([
        fetchPersonalizedCards(),
        fetchReviews(),
        fetchFileProperties(),
    ]);

    // Process each section to fetch its specific items
    const processedSections = await Promise.all(sections.map(async (section) => {
        if (section.visibility === 0) return null;

        if (section.collection_type === 'video') {
            return {
                type: 'video',
                slug: section.slug,
                isVisible: true,
                heading: section.title,
                subheading: section.subtitle,
                videoInputMethod: section.video_input_method,
                videoMedia: section.video_path ? [{ type: 'video', path: section.video_path }] : [],
                videoEmbedLink: section.video_embed_link,
            };
        }

        if (section.collection_type === 'popup') {
            return {
                type: 'popup',
                slug: section.slug,
                isVisible: true,
                heading: section.title,
                subheading: section.subtitle,
                delayMs: section.delay_ms,
                mediaType: section.media_type,
                mediaPath: section.media_path || section.video_embed_link,
            };
        }

        const items = await fetchItemsByIds(section.collection_type, section.selected_items);
        return {
            type: 'collection',
            collection_type: section.collection_type,
            slug: section.slug,
            heading: section.title,
            subheading: section.subtitle,
            items: items
        };
    }));

    const activeSections = processedSections.filter(Boolean);

    // Map back to the structure the homepage expects, or a new flexible one
    // For now, let's keep the return object structure but populate from sections
    const getSectionBySlug = (slug) => activeSections.find(s => s.slug === slug);

    return {
        // Full section objects for dynamic headings/subheadings
        propertiesSection: getSectionBySlug('featured-properties'),
        mapsSection: getSectionBySlug('maps'),
        categoriesSection: getSectionBySlug('categories'),
        filePropertiesSection: getSectionBySlug('files'),
        videoSection: getSectionBySlug('video-section') || null,
        popupSection: getSectionBySlug('landing-popup') || null,
        allFileProperties,
        
        // Static sections
        personalizedCards,
        reviews,
        
        // New: Raw sections for dynamic rendering if needed
        dynamicSections: activeSections
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

export const submitQuery = async (queryData) => {
  const response = await fetch('/api/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit inquiry');
  }

  return response.json();
};
        