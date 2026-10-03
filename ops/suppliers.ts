import type {
  DesignFamilyHandle,
  ProductTypeHandle,
  SupplierKey,
} from '../app/data/catalogue/types.ts';

/**
 * OPERATIONS-ONLY data: suppliers and artwork production status.
 *
 * Lives outside app/ on purpose. It is imported only by scripts, never by
 * the storefront, so supplier names and internal production notes can't
 * reach the client bundle or page HTML. Fulfilment routing happens in
 * Shopify / supplier apps, not in the frontend.
 */
export const SUPPLIERS: Record<
  SupplierKey,
  {name: string; role: string; status: 'launch' | 'later'}
> = {
  printrove: {
    name: 'Printrove',
    role: 'Apparel / core fashion (oversized tee)',
    status: 'launch',
  },
  qikink: {
    name: 'Qikink',
    role: 'Broad POD catalogue and accessories (tote, tumbler)',
    status: 'launch',
  },
  vistaprint: {
    name: 'Vistaprint',
    role: 'Special local / personalised gifting use cases',
    status: 'later',
  },
  kraftix: {
    name: 'Kraftix',
    role: 'Packaging and branding',
    status: 'later',
  },
};

/** Which supplier fulfils each hero product (subject to sampling). */
export const SUPPLIER_BY_PRODUCT_TYPE: Record<ProductTypeHandle, SupplierKey> =
  {
    'oversized-tee': 'printrove',
    tote: 'qikink',
    tumbler: 'qikink',
  };

/**
 * Content revisions required before a production master may go to a
 * supplier. (Technical defects such as edge clipping are detected
 * automatically by `npm run verify:artwork`.)
 */
export const ARTWORK_REVISIONS: Partial<Record<DesignFamilyHandle, string>> = {
  // v2 pack (2026-10-03): 07 Pet Parent (generic, no pet name) and
  // 09 Desi Roots (clearance) reviewed visually and approved. Red-rule
  // collisions are now detected automatically by verify:artwork.
};

/**
 * Masters locked after approval (v2 pack, 2026-10-03). verify:artwork fails
 * if a later pack changes them. 07 + 09 approved; 06 + 10 are V2 and must
 * stay unchanged. Update a hash only with explicit brand approval.
 */
export const LOCKED_MASTERS: Record<string, {sha256: string; reason: string}> =
  {
    '06_us.png': {
      sha256:
        '2a9244f9620bb4fef55aba786038f5a7046f1630e7df873c5e57c7bc4442b058',
      reason: 'V2 master — keep unchanged',
    },
    '07_pet_parent.png': {
      sha256:
        '94726b0e5153d8e6ba1d619bbdfc92f65daf3538888d60fa694da05fc42c90c9',
      reason: 'approved V1 master',
    },
    '09_desi_roots.png': {
      sha256:
        '00efdc31a123e8f0a9001eff882f3278855745b31ec6c922649eb8dd069eda58',
      reason: 'approved V1 master',
    },
    '10_make_it_yours.png': {
      sha256:
        '7626aa1d8752e60ed56d3c324a232d4b958e6bcdec08a958be251bf3b7f9aa5a',
      reason: 'V2 master — keep unchanged',
    },
  };
