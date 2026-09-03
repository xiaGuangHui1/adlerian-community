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

const CATEGORY_THEMES: Record<string, { gradient: string; emoji: string }> = {
  'parent-child-conflict': { gradient: 'from-orange-100 to-rose-100', emoji: '👨‍👩‍👧' },
  'reduce-internal-friction': { gradient: 'from-emerald-100 to-teal-100', emoji: '🍃' },
  'enhance-connection': { gradient: 'from-sky-100 to-indigo-100', emoji: '🤝' },
  'life-courage': { gradient: 'from-amber-100 to-orange-100', emoji: '💪' },
  'relationships': { gradient: 'from-pink-100 to-rose-100', emoji: '👥' },
  'self-acceptance': { gradient: 'from-purple-100 to-pink-100', emoji: '💝' },
  'work-meaning': { gradient: 'from-slate-100 to-blue-100', emoji: '💼' },
  'emotional-confusion': { gradient: 'from-violet-100 to-purple-100', emoji: '💭' },
  'other': { gradient: 'from-stone-100 to-orange-100', emoji: '💬' },
};

const DEFAULT_THEME = { gradient: 'from-stone-100 to-peach-100', emoji: '💬' };

export function getCategoryTheme(category: string) {
  return CATEGORY_THEMES[category] || DEFAULT_THEME;
}
