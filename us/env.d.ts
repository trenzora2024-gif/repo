/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    PUBLIC_META_PIXEL_ID?: string;
    PUBLIC_GA4_ID?: string;
    PUBLIC_GOOGLE_ADS_ID?: string;
    PUBLIC_BUNDLE_DISCOUNTS?: string;
  }
}
