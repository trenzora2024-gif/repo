import type {ProductTypeSpec} from './types.ts';

/**
 * The three hero products. Customer-facing copy states only what the working
 * supplier blanks publish (Printrove: 100% cotton, loose boxy fit; Qikink:
 * cotton canvas tote with long handles, double-wall stainless steel tumbler,
 * sublimation, front-centred placement). Unconfirmed construction details
 * (GSM, neck rib, zip closure, dimensions) stay internal until a sample or a
 * written supplier answer confirms them.
 */
export const PRODUCT_TYPES: ProductTypeSpec[] = [
  {
    handle: 'oversized-tee',
    name: 'Premium Oversized Tee',
    shortName: 'Oversized Tee',
    shopifyProductType: 'T-Shirt',
    skuCode: 'TEE',
    summary: 'A relaxed, boxy oversized tee in soft 100% cotton.',
    materials: ['White, 100% cotton', 'Relaxed, boxy oversized fit'],
    fit: 'Oversized, relaxed boxy fit. Take your usual size for the intended oversized look, or size down for a closer fit.',
    printMethod: 'Printed to order in India.',
    care: [
      'Machine wash cold, inside out',
      'Do not bleach',
      'Do not iron directly on the print',
      'Line dry in shade',
    ],
    option: {name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL']},
    weightGrams: 300,
  },
  {
    handle: 'tote',
    name: 'Everyday Tote',
    shortName: 'Tote',
    shopifyProductType: 'Tote Bag',
    skuCode: 'TOT',
    summary:
      'A sturdy cotton canvas tote with long handles — laptop, groceries, life.',
    materials: ['White cotton canvas', 'Long handles'],
    printMethod: 'Printed to order on one side.',
    care: [
      'Spot clean where possible',
      'Hand wash cold if needed, inside out',
      'Do not iron on the print',
    ],
    weightGrams: 200,
  },
  {
    handle: 'tumbler',
    name: '20oz Tumbler',
    shortName: '20oz Tumbler',
    shopifyProductType: 'Tumbler',
    skuCode: 'TMB',
    summary:
      'A 20oz insulated stainless steel tumbler with the design printed front and centre.',
    materials: [
      'White double-wall stainless steel',
      '20oz (approx. 590 ml) capacity',
      'Lid included',
    ],
    printMethod: 'Sublimation print, made to order.',
    care: [
      'Hand wash only',
      'Not dishwasher or microwave safe',
      'Avoid abrasive scrubbers on the print',
    ],
    weightGrams: 450,
  },
];

export function getProductType(handle: string | undefined | null) {
  return PRODUCT_TYPES.find((type) => type.handle === handle);
}
