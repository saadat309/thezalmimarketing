const shared = {
  propertyType: 'Residential',
  purchaseType: 'sale',
  location: {
    address: 'Synthetic Street',
    city: { slug: 'sample-city', name: 'Sample City' },
    society: { slug: 'sample-society', name: 'Sample Society' },
    phase: { slug: 'phase-one', name: 'Phase One' },
  },
  category: { slug: 'houses', name: 'Houses' },
  area: { value: '1200', unit: 'sqft' },
  price: '12500000',
  beds: 3,
  baths: 2,
  labels: [{ slug: 'featured', name: 'Featured' }],
  thumbnailUrl: 'https://images.example.invalid/sample-main.jpg',
  images: [
    { key: 'synthetic-private-key', url: 'https://images.example.invalid/sample-main.jpg', alt: 'Synthetic home', hidden: false, public: true, position: 2 },
    { key: 'synthetic-hidden-key', url: 'https://images.example.invalid/hidden.jpg', alt: 'Hidden image', hidden: true, public: true, position: 1 },
    { key: 'synthetic-secondary-key', url: 'https://images.example.invalid/sample-secondary.jpg', alt: 'Synthetic second image', hidden: false, public: true, position: 3 },
    { key: 'synthetic-private-media-key', url: 'https://images.example.invalid/private.jpg', alt: 'Private image', hidden: false, public: false, position: 3 },
  ],
  shortDescription: 'Synthetic sample listing.',
  descriptionHtml: '<h2 onclick="run()">Sample description</h2><p>Safe <strong>formatting</strong>.</p><a href="/details">Safe relative link</a><script>run()</script><a href="javascript:run()" onmouseover="run()">Unsafe link</a><a href="/\\evil.example">Backslash link</a><iframe src="https://example.invalid"></iframe>',
  video: { url: 'https://video.example.invalid/sample.mp4', title: 'Synthetic tour', public: true },
  fileOnly: false,
  public: true,
}

const sample = {
  ...shared,
  id: 1,
  slug: 'sample-residence',
  title: 'Sample Residence',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const hidden = { ...shared, id: 999, slug: 'hidden-home', title: 'Hidden Home', public: false }
const fileOnly = { ...shared, id: 998, slug: 'sample-file', title: 'Sample File', fileOnly: true }
const privateVideo = {
  ...shared,
  id: 997,
  slug: 'private-video-home',
  title: 'Private Video Home',
  createdAt: '2026-01-02T00:00:00.000Z',
  video: { ...shared.video, public: false },
}

const generated = Array.from({ length: 54 }, (_, index) => ({
  ...shared,
  id: index + 2,
  slug: `synthetic-home-${String(index + 1).padStart(2, '0')}`,
  title: `Synthetic Home ${index + 1}`,
  createdAt: `2026-${String(Math.floor(index / 28) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
}))

export const syntheticProperties = [sample, hidden, fileOnly, privateVideo, ...generated]
