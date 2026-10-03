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
  'desi-roots':
    'Visual overlap: the descender of “मुंबई” crosses the red rule and touches “SAME ROOTS. NEW STORIES.” Keep the text, concept and typography; give the Marathi text clear space from the rule and tagline. (Visual check — clear this entry only after reviewing the revised master.)',
  'pet-parent':
    'The current master reads “BRUNO’S HUMAN · PET PARENT CLUB”. It is not approved for launch and needs a generic “PET PARENT CLUB” treatment with no pet name before supplier upload.',
};
