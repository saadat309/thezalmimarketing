// Fabricated display fixtures for the homepage parity preview. These are not
// copied from production and are not loaded through an API.
const sampleImage = '/dha birdeye view.webp';

const sampleProperties = [
  {
    slug: 'garden-court-villa',
    image: sampleImage,
    imageThumb: sampleImage,
    title: 'Garden Court Villa',
    price: 48000000,
    currency: 'PKR',
    location: 'Sample District',
    city: 'Lahore',
    beds: 5,
    baths: 5,
    area: 20,
    areaUnit: 'marla',
    category: 'House',
    property_type: 'Residential',
    badges: [{ label: 'Synthetic sample', is_badge: true }],
    short_desc: 'A fabricated listing used only to preview the homepage layout.',
  },
  {
    slug: 'parkline-residences',
    image: sampleImage,
    imageThumb: sampleImage,
    title: 'Parkline Residences',
    price: 22500000,
    currency: 'PKR',
    location: 'Sample District',
    city: 'Lahore',
    beds: 3,
    baths: 2,
    area: 1650,
    areaUnit: 'sqft',
    category: 'Apartment',
    property_type: 'Residential',
    badges: [{ label: 'Synthetic sample', is_badge: true }],
    short_desc: 'A fabricated apartment listing for the isolated staging preview.',
  },
];

const sampleFiles = [
  {
    ...sampleProperties[1],
    slug: 'sample-allocation-file',
    title: 'Sample Allocation File',
    is_file: true,
    file_type: 'Allocation',
    short_desc: 'Synthetic file card; no document is attached or downloadable.',
  },
  {
    ...sampleProperties[0],
    slug: 'sample-investment-file',
    title: 'Sample Investment File',
    is_file: true,
    file_type: 'Investment',
    short_desc: 'Synthetic file card; no document is attached or downloadable.',
  },
];

export function getSyntheticHomeData() {
  return {
    categoriesSection: {
      heading: 'Explore Property Categories',
      subheading: 'A sample of the categories featured in the source homepage.',
      items: [
        { id: 'sample-homes', title: 'Homes', count: 12, src: sampleImage, thumb: sampleImage },
        { id: 'sample-apartments', title: 'Apartments', count: 8, src: sampleImage, thumb: sampleImage },
        { id: 'sample-plots', title: 'Plots', count: 16, src: sampleImage, thumb: sampleImage },
        { id: 'sample-commercial', title: 'Commercial', count: 5, src: sampleImage, thumb: sampleImage },
      ],
    },
    propertiesSection: {
      heading: 'Featured Sample Properties',
      subheading: 'Fabricated listings keep the section layout visible without production inventory.',
      items: sampleProperties,
    },
    filePropertiesSection: {
      heading: 'Sample Plot Files',
      subheading: 'These cards are visual fixtures only; no file media or downloads are connected.',
      items: sampleFiles,
    },
    mapsSection: {
      heading: 'Society Maps Preview',
      subheading: 'Synthetic map cards for layout review; no downloadable maps are attached.',
      items: [
        { id: 'sample-map-one', title: 'Sample District Master Plan', image: sampleImage, description: 'Synthetic map listing for the homepage design preview.', pdfPath: '/maps#sample-map' },
        { id: 'sample-map-two', title: 'Sample Green Block Plan', image: sampleImage, description: 'Synthetic map listing for the homepage design preview.', pdfPath: '/maps#sample-map' },
      ],
    },
    personalizedCards: [
      { title: 'Find a property that fits your plans', description: 'This sample callout preserves the source homepage layout while inventory integration remains deferred.', buttonText: 'Explore Properties', buttonLink: '/properties', imagePath: sampleImage },
      { title: 'Explore the sample map library', description: 'Map listings and downloads will be connected only in the later synthetic API task.', buttonText: 'Browse Maps', buttonLink: '/maps', imagePath: sampleImage },
    ],
    reviews: [
      { id: 'synthetic-review-1', name: 'Sample Visitor', role: 'Synthetic review fixture', text: 'This fabricated review is included only to validate the homepage testimonial layout.' },
    ],
    allFileProperties: [],
    videoSection: null,
    popupSection: null,
  };
}
