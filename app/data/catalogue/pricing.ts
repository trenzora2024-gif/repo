import type {ProductTypeHandle} from './types.ts';

/**
 * V1 launch retail prices in INR (GST inclusive), one price per product type.
 * Approved by the owner on 2026-10-03. Not recalculated from supplier costs
 * unless the owner asks to revisit pricing; supplier costs and margins live
 * in ops/ (`npm run costs:check`), never here.
 *
 * No compare-at prices: Trenzora does not show fake discounts.
 */
export const RETAIL_PRICE_INR: Record<ProductTypeHandle, number> = {
  'oversized-tee': 999,
  tote: 599,
  tumbler: 1099,
};

/** Optional per-design overrides, e.g. {'make-it-yours:tumbler': 1199}. */
export const PRICE_OVERRIDES_INR: Record<string, number> = {};

/**
 * Price status. 'approved' means the owner signed off the prices above;
 * `npm run launch:audit` then requires PRICE_APPROVAL to say who and when.
 */
export const PRICE_STATUS: 'provisional' | 'approved' = 'approved';
export const PRICE_APPROVAL =
  'Owner approved V1 launch prices ₹999 / ₹599 / ₹1,099 on 2026-10-03';
