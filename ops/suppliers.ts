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
  // None. V1 artwork signed off on 2026-10-03 (v7 pack). 04 and 08 are set
  // in Lato, accepted by the brand owner; no further revisions requested.
};

/**
 * All 10 masters locked at the signed-off v7 pack (2026-10-03).
 * verify:artwork fails if any file changes. Update a hash only with explicit
 * brand approval.
 */
export const LOCKED_MASTERS: Record<string, {sha256: string; reason: string}> =
  {
    '01_mumbai_made.png': {
      sha256:
        '36d53398be6317abfc12bfc3fa23ba317a91cc9beeaee205b918da18bf7d7914',
      reason: 'approved V1 master',
    },
    '02_local_life.png': {
      sha256:
        '228de52c41d466726087a62d5505496020bf83f44a3a864b152bcf163a8ee339',
      reason: 'approved V1 master',
    },
    '03_corporate_survivor.png': {
      sha256:
        'c2bc169cdbf7aa470cbba5e7ff668bdc794f361fa9a64b6f9300b85fc5465e13',
      reason: 'approved V1 master',
    },
    '04_coffee_personality.png': {
      sha256:
        '07be0de986529dc2b1c6b20e6c09ebff120a0869439f28e51a7b4537b224923a',
      reason: 'approved V1 master (v7, Lato accepted)',
    },
    '05_bestie_energy.png': {
      sha256:
        'f3128ecc53b217a65757a124fedaaac83ef31c89af66d3b6d21bc59e54628c6e',
      reason: 'approved V1 master',
    },
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
    '08_campus_energy.png': {
      sha256:
        'b3c9e3d80a13e1493ea6b0d9bd009ed56d87acb5e1465e394910e2371c12d832',
      reason: 'approved V1 master (v7, Lato accepted)',
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
