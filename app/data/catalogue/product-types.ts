import type {ProductTypeSpec} from './types.ts';

/**
 * The three hero products. Specs are written to the category standard of the
 * selected supplier blanks — confirm every line against the supplier spec
 * sheet during sampling before launch.
 */
export const PRODUCT_TYPES: ProductTypeSpec[] = [
  {
    handle: 'oversized-tee',
    name: 'Premium Oversized Tee',
    shortName: 'Oversized Tee',
    shopifyProductType: 'T-Shirt',
    skuCode: 'TEE',
    summary:
      'A heavyweight, relaxed-fit tee with dropped shoulders and a boxy drape.',
    materials: ['100% cotton, heavyweight jersey', 'Ribbed crew neck'],
    fit: 'Oversized, relaxed fit with dropped shoulders. Take your usual size for the intended oversized look, or size down for a closer fit.',
    printMethod: 'Direct-to-garment (DTG) print, made to order.',
    care: [
      'Machine wash cold, inside out',
      'Do not bleach',
      'Do not iron directly on the print',
      'Line dry in shade',
    ],
    option: {name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL']},
    supplier: 'printrove',
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
    materials: ['Natural cotton canvas', 'Long shoulder handles'],
    printMethod: 'Printed to order on one side.',
    care: [
      'Spot clean where possible',
      'Hand wash cold if needed, inside out',
      'Do not iron on the print',
    ],
    supplier: 'qikink',
    weightGrams: 200,
  },
  {
    handle: 'tumbler',
    name: '20oz Tumbler',
    shortName: '20oz Tumbler',
    shopifyProductType: 'Tumbler',
    skuCode: 'TMB',
    summary: 'A 20oz insulated stainless steel tumbler, printed edge to edge.',
    materials: [
      'Double-wall stainless steel',
      '20oz (approx. 590 ml) capacity',
      'Lid included',
    ],
    printMethod: 'Sublimation print, made to order.',
    care: [
      'Hand wash only',
      'Not dishwasher or microwave safe',
      'Avoid abrasive scrubbers on the print',
    ],
    supplier: 'qikink',
    weightGrams: 450,
  },
];

export function getProductType(handle: string | undefined | null) {
  return PRODUCT_TYPES.find((type) => type.handle === handle);
}
