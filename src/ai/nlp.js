const CATEGORY_WORDS = {
  "men's clothing": ["mens", "men", "men's", "male", "guys", "men clothing"],
  "women's clothing": ["womens", "womens clothing", "women", "women's", "female", "ladies", "women clothing"],
  "jewelery": ["jewelry", "jewelery", "ring", "necklace", "bracelet", "earrings"],
  "electronics": ["electronics", "phone", "smartphone", "laptop", "headphone", "headphones", "earbuds", "camera", "tv"]
};

// Normalize quotes and spaces so "men's" / "mens" behave
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCategory(tokens){
  const toks = tokens.map(normalize);
  for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
    if (toks.some(t => words.includes(t))) return cat; // return EXACT Fakestore key
  }
  return null;
}

function detectPrice(tokens){
  const text = normalize(tokens.join(' '));
  // allow $50 or $ 50
  const nums = Array.from(text.matchAll(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/g))
    .map(m => parseFloat(m[1]));

  let maxPrice=null, minPrice=null;
  if (/between|from/.test(text) && nums.length >= 2) {
    minPrice = Math.min(nums[0], nums[1]);
    maxPrice = Math.max(nums[0], nums[1]);
  } else if (/(under|below|less than|<=)/.test(text) && nums.length >= 1) {
    maxPrice = nums[0];
  } else if (/(over|above|greater than|>=)/.test(text) && nums.length >= 1) {
    minPrice = nums[0];
  } else if (nums.length === 1 && /(budget|cheap|affordable)/.test(text)) {
    maxPrice = nums[0];
  }
  return { minPrice, maxPrice };
}

function detectRating(tokens){
  const text = normalize(tokens.join(' '));
  if (/(great|good|high).*review|good reviews|4\+|4 stars|five star/.test(text)) return 4.2;
  const m = text.match(/(\d(?:\.\d)?)\s*stars?/);
  if (m) return parseFloat(m[1]);
  return null;
}

function extractKeywords(tokens){
  const stop = new Set(['show','me','with','and','or','the','a','an','for','to','of','under','over','between','below','above','than','less','greater','good','great','best','cheap','affordable','reviews','review','star','stars']);
  return tokens
    .map(normalize)
    .filter(t => !stop.has(t) && !/^[0-9.]+$/.test(t) && t.length>2);
}

export function parseQuery(q){
  if (!q) return {};
  const tokens = normalize(q).replace(/[^a-z0-9.$'\s-]/g,' ').split(/\s+/).filter(Boolean);
  const category = detectCategory(tokens);
  const { minPrice, maxPrice } = detectPrice(tokens);
  const minRating = detectRating(tokens);
  const keywords = extractKeywords(tokens);
  return { category, minPrice, maxPrice, minRating, keywords };
}

export function applyFilters(products, { category, minPrice, maxPrice, minRating, keywords }){
  return products.filter(p=>{
    const ratingVal = typeof p.rating === 'number' ? p.rating : (p.rating?.rate ?? 0);
    if (category && p.category !== category) return false;        // exact match to Fakestore category
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    if (minRating != null && ratingVal < minRating) return false;
    if (keywords && keywords.length){
      const hay = `${p.title ?? p.name ?? ''} ${p.description ?? ''}`.toLowerCase();
      if (!keywords.every(k => hay.includes(k))) return false;
    }
    return true;
  });
}