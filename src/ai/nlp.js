const CATEGORY_WORDS = {
  shoes: ['shoe','shoes','sneaker','sneakers','running','trainer','trainers'],
  electronics: ['phone','smartphone','laptop','headphone','headphones','earbuds'],
  apparel: ['shirt','tshirt','t-shirt','hoodie','jacket','jeans'],
  outdoors: ['tent','camp','camping','hiking','backpack'],
  beauty: ['skincare','serum','cream','makeup','beauty'],
  home: ['kitchen','vacuum','mixer','cook','home']
};

function detectCategory(tokens){
  for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
    if (tokens.some(t => words.includes(t))) return cat;
  }
  return null;
}

function detectPrice(tokens){
  const text = tokens.join(' ');
  const nums = Array.from(text.matchAll(/\$?([0-9]+(?:\.[0-9]{1,2})?)/g)).map(m => parseFloat(m[1]));
  let maxPrice=null,minPrice=null;
  if (/between|from/i.test(text) && nums.length>=2){ minPrice=Math.min(nums[0],nums[1]); maxPrice=Math.max(nums[0],nums[1]); }
  else if (/(under|below|less than|<=)/i.test(text) && nums.length>=1){ maxPrice=nums[0]; }
  else if (/(over|above|greater than|>=)/i.test(text) && nums.length>=1){ minPrice=nums[0]; }
  else if (nums.length===1 && /(budget|cheap|affordable)/i.test(text)){ maxPrice=nums[0]; }
  return { minPrice, maxPrice };
}

function detectRating(tokens){
  const text = tokens.join(' ');
  if (/(great|good|high).*review|good reviews|4\+|4 stars|five star/i.test(text)) return 4.2;
  const m = text.match(/(\d(?:\.\d)?)\s*stars?/i);
  if (m) return parseFloat(m[1]);
  return null;
}

function extractKeywords(tokens){
  const stop = new Set(['show','me','with','and','or','the','a','an','for','to','of','under','over','between','below','above','than','less','greater','good','great','best','cheap','affordable','reviews','star','stars']);
  return tokens.filter(t => !stop.has(t) && !/^[0-9.]+$/.test(t) && t.length>2);
}

export function parseQuery(q){
  if (!q) return {};
  const tokens = q.toLowerCase().replace(/[^a-z0-9.$\s-]/g,' ').split(/\s+/).filter(Boolean);
  const category = detectCategory(tokens);
  const { minPrice, maxPrice } = detectPrice(tokens);
  const minRating = detectRating(tokens);
  const keywords = extractKeywords(tokens);
  return { category, minPrice, maxPrice, minRating, keywords };
}

export function applyFilters(products, { category, minPrice, maxPrice, minRating, keywords }) {
  return products.filter(p => {
    // Fakestore: rating may be { rate, count }
    const ratingVal = typeof p.rating === 'number' ? p.rating : (p.rating?.rate ?? 0);

    if (category && p.category !== category) return false;
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    if (minRating != null && ratingVal < minRating) return false;

    if (keywords && keywords.length) {
      // Fakestore uses `title`
      const hay = `${p.title ?? p.name ?? ''} ${p.description ?? ''}`.toLowerCase();
      if (!keywords.every(k => hay.includes(k))) return false;
    }
    return true;
  });
}
