import { drinkPics } from './drinkPicsIndex';

// Helpers to derive metadata from filenames
const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
const detectCategory = (filename) => {
  const f = filename.toLowerCase();
  if (f.includes('tequila') || f.includes('casamigos') || f.includes('don-julio') || f.includes('patron')) return 'tequila';
  if (f.includes('cognac') || f.includes('hennessy') || f.includes('remy') || f.includes('martell')) return 'cognac';
  if (f.includes('vodka') || f.includes('ciroc') || f.includes('absolut') || f.includes('grey-goose')) return 'vodka';
  if (f.includes('whisky') || f.includes('whiskey') || f.includes('glen') || f.includes('johnnie') || f.includes('jack') || f.includes('chivas')) return f.includes('whiskey') ? 'whiskey' : 'whisky';
  return 'spirits';
};
const detectBrand = (filename) => {
  const map = [
    ['absolut', 'Absolut'],
    ['ciroc', 'Cîroc'],
    ['grey-goose', 'Grey Goose'],
    ['johnnie', 'Johnnie Walker'],
    ['macallan', 'Macallan'],
    ['glenlivet', 'The Glenlivet'],
    ['glenfiddich', 'Glenfiddich'],
    ['jack-daniels', "Jack Daniel's"],
    ['jameson', 'Jameson'],
    ['hennessy', 'Hennessy'],
    ['remy', 'Rémy Martin'],
    ['martell', 'Martell'],
    ['don-julio', 'Don Julio'],
    ['patron', 'Patrón'],
    ['monkey-shoulder', 'Monkey Shoulder'],
    ['chivas', 'Chivas Regal'],
    ['famous-grouse', 'Famous Grouse'],
    ['casamigos', 'Casamigos'],
    ['clase', 'Clase Azul']
  ];
  const f = filename.toLowerCase();
  for (const [key, brand] of map) {
    if (f.includes(key)) return brand;
  }
  return titleCase(f.split('/').pop().split('-')[0]);
};

const computePrice = (file, brand, category, idx) => {
  const f = file.toLowerCase();
  // Ultra luxury signals
  if (f.includes('1942') || f.includes('clase') || f.includes('25-year') || f.includes('25-year-old') || f.includes('xo') || f.includes('signet') || f.includes('grandreserva') || f.includes('grand_reserva') || f.includes('grand')) {
    const base = 300000 + (idx % 5) * 25000; // 300k - 400k
    return base;
  }
  // High-end aged 18yo / VSOP / premium single malts
  if (f.includes('18-year') || f.includes('18-year-old') || f.includes('vsop') || f.includes('glenfiddich') || f.includes('macallan-18') || f.includes('glenlivet-18')) {
    const base = 160000 + (idx % 5) * 20000; // 160k - 240k
    return base;
  }
  // Brand-based premiums
  if (brand === 'Macallan') return 120000 + (idx % 3) * 15000; // 120k+
  if (brand === 'Hennessy' && f.includes('vs')) return 95000; // VS ~95k
  if (brand === 'Rémy Martin' && f.includes('vsop')) return 135000; // VSOP
  if (brand === 'Cîroc') return 85000;
  if (brand === 'Grey Goose') return 78000;
  if (brand === 'Johnnie Walker' && (f.includes('black') || f.includes('12'))) return 65000;
  // Default tiered base
  return 50000 + (idx % 10) * 5000;
};

export const drinksDatabase = drinkPics.map((path, idx) => {
  const file = path.split('/').pop().replace(/\.[^.]+$/, '');
  const brand = detectBrand(file);
  const category = detectCategory(file);
  const readable = titleCase(file.replace(/\d+/g, ' ').replace(/\([^)]*\)/g, ' '));

  // Prices & discount
  const price = computePrice(file, brand, category, idx);
  const originalPrice = Math.round(price * 1.1);
  const discount = 10;

  const origin = category === 'tequila' ? 'Mexico' : category === 'vodka' ? 'Sweden/France' : category.includes('whis') ? 'Scotland/Ireland/USA' : 'France';

  return {
    id: idx + 1,
    name: readable,
    brand,
    category,
    subcategory: 'premium',
    price,
    originalPrice,
    discount,
    images: [path],
    rating: 4.6,
    reviewCount: 100 + idx * 3,
    stockQuantity: 20 + (idx % 30),
    alcoholContent: category === 'tequila' ? 38 : 40,
    volume: 750,
    origin,
    description: `${brand} ${category} crafted with quality and authenticity.`,
    tastingNotes: ['Smooth', 'Balanced', 'Aromatic'],
    bestOccasions: ['Celebrations', 'Gifts', 'Evenings'],
    whatItRepresents: 'Premium quality and great taste',
    personality: 'Elegant and confident',
    perfectPairings: ['Dark chocolate', 'Citrus', 'Good company'],
    originStory: 'Carefully curated from renowned distilleries around the world.',
    awards: [],
    servingSuggestions: ['Enjoy neat, on ice, or in cocktails']
  };
});

export const getByCategory = (category) => drinksDatabase.filter(d => d.category === category);
export const getByOccasion = (occasion) => drinksDatabase.filter(d => d.bestOccasions.some(occ => occ.toLowerCase().includes(occasion.toLowerCase())));
export const getByPriceRange = (min, max) => drinksDatabase.filter(d => d.price >= min && d.price <= max);
export const getFeaturedPremium = () => drinksDatabase.slice(0, 8);
export const getPersonalityMatches = (personality) => drinksDatabase.filter(d => d.personality.toLowerCase().includes(personality.toLowerCase()));