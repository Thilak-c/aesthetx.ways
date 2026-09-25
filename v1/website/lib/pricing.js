// website/lib/pricing.js

const DISCOUNT_POOL = [15, 20, 25, 30, 35, 40, 45, 50];

/**
 * Deterministically generates a hash code from an ID or string.
 */
function hashString(str) {
  let hash = 0;
  const s = String(str || 'default');
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculates deterministic MRP (cut price) and discount percentage for a product.
 * @param {Object|number|string} productOrPrice - Product object or price number
 * @param {string} [optionalId] - Product ID if passing price directly
 * @returns {{ price: number, originalPrice: number, discountPercent: number, savings: number }}
 */
export function getProductPricing(productOrPrice, optionalId) {
  let price = 0;
  let id = '';

  if (typeof productOrPrice === 'object' && productOrPrice !== null) {
    price = Number(productOrPrice.price) || 0;
    id = String(productOrPrice.itemId || productOrPrice.productId || productOrPrice.id || productOrPrice._id || productOrPrice.name || price);
  } else {
    price = Number(productOrPrice) || 0;
    id = String(optionalId || price);
  }

  if (price <= 0) {
    return { price: 0, originalPrice: 0, discountPercent: 0, savings: 0 };
  }

  const hash = hashString(id);
  const discountPercent = DISCOUNT_POOL[hash % DISCOUNT_POOL.length];

  // Calculate raw original MRP
  const rawOriginal = price / (1 - discountPercent / 100);

  // Round nicely to e-commerce pricing (nearest 50 or 10)
  let roundedOriginal = Math.round(rawOriginal / 10) * 10;
  if (roundedOriginal <= price) {
    roundedOriginal = Math.ceil((price * (1 + discountPercent / 100)) / 10) * 10;
  }

  // Recalculate true discount percent based on the rounded original price
  const actualDiscount = Math.round(((roundedOriginal - price) / roundedOriginal) * 100);

  return {
    price,
    originalPrice: roundedOriginal,
    discountPercent: actualDiscount > 0 ? actualDiscount : discountPercent,
    savings: Math.max(0, roundedOriginal - price),
  };
}
