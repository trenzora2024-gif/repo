import type {ProductTypeHandle} from './types.ts';

/**
 * Launch retail prices in INR (GST inclusive), one price per product type.
 *
 * These are placeholders inside the agreed target ranges and MUST be revisited
 * after landed-cost validation (blank + print + shipping + gateway + returns).
 * No supplier costs or margins are stored here on purpose.
 *
 * No compare-at prices: Trenzora does not show fake discounts.
 */
export const RETAIL_PRICE_INR: Record<ProductTypeHandle, number> = {
  'oversized-tee': 999, // target range ₹899–₹1,099
  tote: 599, // target range ₹499–₹699
  tumbler: 1099, // target range ₹899–₹1,199
};

/** Optional per-design overrides, e.g. {'make-it-yours:tumbler': 1199}. */
export const PRICE_OVERRIDES_INR: Record<string, number> = {};

/**
 * Price status. Stays 'provisional' until `npm run costs:check` has complete,
 * sourced rows for every product type AND the owner approves prices (Gate 4).
 * `npm run launch:audit` fails if this is 'approved' while costs are incomplete.
 */
export const PRICE_STATUS: 'provisional' | 'approved' = 'provisional';
