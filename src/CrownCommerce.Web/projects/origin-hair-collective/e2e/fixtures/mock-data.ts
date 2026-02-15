// ── Products ──

export const mockProducts = [
  {
    id: 'prod-001',
    name: 'Virgin Hair Bundles',
    originId: 'org-001',
    originCountry: 'Brazil',
    texture: 'Body Wave',
    type: 'bestseller',
    lengthInches: 18,
    description: 'Brazilian, Peruvian & Malaysian textures available in 10–30 inch lengths.',
    price: 85,
    imageUrl: '/assets/products/bundles.jpg',
  },
  {
    id: 'prod-002',
    name: 'Lace Closures',
    originId: 'org-002',
    originCountry: 'Peru',
    texture: 'Straight',
    type: 'essential',
    lengthInches: 16,
    description: 'HD lace closures for a seamless, natural look. 4x4 and 5x5 options.',
    price: 65,
    imageUrl: '/assets/products/closures.jpg',
  },
  {
    id: 'prod-003',
    name: 'Lace Frontals',
    originId: 'org-001',
    originCountry: 'Brazil',
    texture: 'Straight',
    type: 'premium',
    lengthInches: 20,
    description: '13x4 and 13x6 HD lace frontals for a flawless ear-to-ear hairline.',
    price: 95,
    imageUrl: '/assets/products/frontals.jpg',
  },
];

// ── Testimonials ──

export const mockTestimonials = [
  {
    id: 'test-001',
    content:
      "I've tried every hair brand out there. Origin is different — the quality is unmatched, the texture is beautiful, and it literally lasts forever. I'm never going back.",
    customerName: 'Jasmine T.',
    customerLocation: 'Toronto',
    rating: 5,
  },
];

// ── Gallery ──

export const mockGalleryImages = [
  { id: 'gal-001', imageUrl: '/assets/gallery/community-1.jpg', caption: 'Look 1', category: 'community' },
  { id: 'gal-002', imageUrl: '/assets/gallery/community-2.jpg', caption: 'Look 2', category: 'community' },
  { id: 'gal-003', imageUrl: '/assets/gallery/community-3.jpg', caption: 'Look 3', category: 'community' },
  { id: 'gal-004', imageUrl: '/assets/gallery/community-4.jpg', caption: 'Look 4', category: 'community' },
  { id: 'gal-005', imageUrl: '/assets/gallery/community-5.jpg', caption: 'Look 5', category: 'community' },
  { id: 'gal-006', imageUrl: '/assets/gallery/community-6.jpg', caption: 'Look 6', category: 'community' },
];

// ── Newsletter ──

export const mockNewsletterResponse = {
  email: 'test@example.com',
  subscribedAt: new Date().toISOString(),
};
