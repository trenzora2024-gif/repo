import type {SupplierKey} from './types.ts';

/**
 * Supplier registry. Used only by catalogue exports and operations docs —
 * never by storefront rendering. Fulfilment routing happens in Shopify /
 * supplier apps, not in the frontend.
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
