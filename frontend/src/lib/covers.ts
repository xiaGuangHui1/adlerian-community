import type { Resource } from '../types';

const COVER_IMAGES: Record<string, string[]> = {
  concept: ['/covers/concept-1.jpg', '/covers/concept-2.jpg', '/covers/concept-3.jpg', '/covers/concept-4.jpg'],
  book: ['/covers/book-1.jpg', '/covers/book-2.jpg', '/covers/book-3.jpg'],
  bio: ['/covers/bio-1.jpg', '/covers/bio-2.jpg'],
  practice: ['/covers/practice-1.jpg', '/covers/practice-2.jpg'],
  article: ['/covers/practice-1.jpg', '/covers/practice-2.jpg'],
  quote: ['/covers/concept-1.jpg', '/covers/concept-3.jpg'],
};

export function getResourceCover(resource: Resource): string {
  const list = COVER_IMAGES[resource.type] || COVER_IMAGES.concept;
  return list[resource.id % list.length];
}

const CATEGORY_COVERS: Record<string, string> = {
  'parent-child-conflict': '/covers/concept-2.jpg',
  'reduce-internal-friction': '/covers/concept-1.jpg',
  'enhance-connection': '/covers/concept-3.jpg',
  'life-courage': '/covers/concept-1.jpg',
  'relationships': '/covers/concept-3.jpg',
  'self-acceptance': '/covers/concept-4.jpg',
  'work-meaning': '/covers/concept-2.jpg',
  'emotional-confusion': '/covers/concept-4.jpg',
  'other': '/covers/concept-1.jpg',
};

export function getPostCover(category: string): string {
  return CATEGORY_COVERS[category] || '/covers/concept-1.jpg';
}
