import {BUSINESS, RETURNS, SHIPPING, SITE} from './site.ts';

/**
 * Customer policies for trenzora.in, written once and used twice:
 *  - rendered by the Hydrogen routes (/shipping, /policies/*), and
 *  - exported by `npm run policies:export` to catalogue/policies/*.html for
 *    Shopify's native policy fields (Settings → Policies), after owner review.
 *
 * Rules: no supplier names, no invented legal details. Anything not yet
 * provided in BUSINESS is omitted here and listed in LAUNCH-BLOCKERS.md.
 * This is not legal advice; have it reviewed before relying on it.
 */
export const POLICIES_UPDATED = '4 October 2026';

export type Policy = {
  handle: string;
  title: string;
  /** Meta description: plain, customer-facing, under 160 characters. */
  description: string;
  /** Shopify native policy field this text belongs in, if any. */
  shopifyField?:
    | 'Refund policy'
    | 'Privacy policy'
    | 'Terms of service'
    | 'Shipping policy'
    | 'Contact information';
  html: string;
};

const email = `<a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>`;
const phone = `<a href="${BUSINESS.phoneHref}">${BUSINESS.phone}</a>`;
const address = BUSINESS.address.join(', ');
const businessName = BUSINESS.legalName ?? BUSINESS.tradingName;
const days = RETURNS.windowDays;

const hours = BUSINESS.supportHours ? ` (${BUSINESS.supportHours})` : '';
const officer = BUSINESS.grievanceOfficer;
const grievance = officer
  ? `<p><strong>Grievance Officer:</strong> ${officer.name}, ${officer.designation}. Email ${email} or call ${phone}. We acknowledge complaints within 48 hours and aim to resolve them within one month.</p>`
  : '';

const contactBlock = `<p>Email ${email} or call ${phone}${hours}. Please include your order number.</p>
${grievance}
<p>${businessName}, ${address}.</p>`;

const shipping: Policy = {
  handle: 'shipping-policy',
  title: 'Shipping policy',
  description:
    'Where Trenzora delivers, how long made-to-order production and delivery usually take, tracking, and what to do if a delivery goes wrong.',
  shopifyField: 'Shipping policy',
  html: `<p>Last updated: ${POLICIES_UPDATED}</p>
<h2>Where we deliver</h2>
<p>We currently deliver within India only.</p>
<h2>Made to order</h2>
<p>Every Trenzora piece is made after you order. Production usually takes ${SHIPPING.productionDays} after your order is confirmed.</p>
<h2>Delivery time</h2>
<p>After dispatch, delivery usually takes ${SHIPPING.deliveryDays}, depending on your pin code. In total, most orders arrive within ${SHIPPING.totalEstimate} of ordering. These are estimates, not guarantees. Some pin codes, public holidays, weather and courier volumes can add time.</p>
<h2>Shipping charges</h2>
<p>Shipping is free on all orders delivered in India.</p>
<h2>Tracking</h2>
<p>When your order is dispatched, we email you a tracking link. Your order confirmation email also links to your order status page. If you haven’t received a tracking link within ${SHIPPING.productionDays} of ordering, write to us.</p>
<h2>Your delivery address</h2>
<p>Please check your name, address, pin code and phone number at checkout. We can change the address only before your order is dispatched, so write to us straight away if you notice a mistake.</p>
<p>If a delivery attempt fails, the courier will usually reattempt delivery once or twice, and may call you on the phone number you gave at checkout. If the order still can’t be delivered because the address or phone number was incomplete or incorrect, or because nobody was available, the parcel is returned to us. We’ll contact you to arrange re-delivery, and the re-delivery shipping charge is payable by you. Because each piece is made to order, we may not be able to offer a refund for an order returned for these reasons.</p>
<h2>Damaged parcel</h2>
<p>If the parcel looks damaged or tampered with when it arrives, take photos of the parcel before opening it if you can. Email us within ${days} days of delivery with your order number and photos of the parcel and the product. See our <a href="/policies/refund-policy">refund policy</a> for what happens next.</p>
<h2>Marked as delivered but not received</h2>
<p>Check with neighbours, family or building security first, as couriers sometimes hand parcels to them. If you still can’t find it, email us within ${days} days of the date shown as delivered. We’ll raise it with the courier. If the courier confirms the parcel was lost, we’ll send a replacement or refund you.</p>
<h2>Contact</h2>
${contactBlock}`,
};

const refund: Policy = {
  handle: 'refund-policy',
  title: 'Returns & refund policy',
  description:
    'Made-to-order products: how Trenzora handles damaged, defective, misprinted or wrong items, and what isn’t covered.',
  shopifyField: 'Refund policy',
  html: `<p>Last updated: ${POLICIES_UPDATED}</p>
<p>Every Trenzora piece is made to order for you after you buy it. It isn’t picked from stock, so we can’t resell a returned item. That’s why we don’t accept returns for change of mind. If something is wrong with your order, though, we’ll put it right.</p>
<p><strong>Returns are accepted only with our approval.</strong> Please don’t send a product to any address, including the address on our website or invoice, unless we have approved your claim in writing and told you exactly where and how to send it. We can’t accept, refund or replace items sent without approval.
<h2>How to make a claim</h2>
<p>Email ${email} within <strong>${days} days of delivery</strong> with:</p>
<ul>
<li>your order number;</li>
<li>clear photos of the product, showing the problem;</li>
<li>a photo of the shipping label and packaging;</li>
<li>for damage in transit, photos of the parcel, and an unboxing video if you have one.</li>
</ul>
<p>We’ll review your claim and reply by email. For most approved claims you don’t need to send the product back. If we do need it, we’ll tell you how in our approval email.</p>
<h2>What we cover</h2>
<p>For each of the following, once we’ve verified your claim, we’ll send a replacement at no cost. If a replacement isn’t possible, we’ll refund what you paid for the affected item.</p>
<ul>
<li><strong>Wrong product received:</strong> a different design, product or size from the one in your order confirmation.</li>
<li><strong>Damaged or defective product:</strong> damaged in transit, or faulty when it arrives (for example, a torn seam, a broken tumbler lid or a hole in the fabric).</li>
<li><strong>Printing or manufacturing defect:</strong> a misprint, smudged, missing or wrongly placed print, or a clear production fault.</li>
<li><strong>Significantly different from what you ordered:</strong> a product that clearly doesn’t match its product page. Small differences in print colour or placement between screens and the printed product are normal for made-to-order printing and aren’t defects.</li>
</ul>
<h2>What we don’t cover</h2>
<ul>
<li><strong>Change of mind:</strong> we can’t accept returns or exchanges for change of mind, because each piece is made for your order.</li>
<li><strong>Wrong size chosen:</strong> we can’t exchange a size you selected. Please check the size details on the product page before ordering. If you notice a mistake straight after ordering, write to us at once. We can change the size only before production starts.</li>
<li><strong>Incorrect address:</strong> see our <a href="/shipping">shipping policy</a>. Re-delivery charges apply, and a refund may not be possible.</li>
<li><strong>Normal wear and tear:</strong> fading, wear or damage from use, washing, or not following the care instructions on the product page.</li>
<li><strong>Claims after ${days} days</strong> from delivery, or without the photos we need to verify them.</li>
</ul>
<h2>Cash on Delivery</h2>
<p>Cash on Delivery isn’t currently offered. If we introduce it, orders that are refused or not collected will be handled like undeliverable orders under our shipping policy, and we may not offer Cash on Delivery on future orders.</p>
<h2>Personalized products</h2>
<p>Personalized products aren’t available yet. When they launch, this policy will be updated before they go on sale.</p>
<h2>Refunds</h2>
<p>Approved refunds go back to your original payment method. We start the refund within 7 working days of approving it. How long it takes to show in your account depends on your bank or payment provider. We’ll confirm by email when it’s done.</p>
<h2>Cancellations</h2>
<p>See our <a href="/policies/cancellation-policy">cancellation policy</a>.</p>
<h2>Contact</h2>
${contactBlock}`,
};

const cancellationTiming = BUSINESS.cancellationWindowHours
  ? `within ${BUSINESS.cancellationWindowHours} hours of placing it, as long as it hasn’t gone into production`
  : 'until it goes into production';

const cancellation: Policy = {
  handle: 'cancellation-policy',
  title: 'Cancellation policy',
  description:
    'When a made-to-order Trenzora order can be cancelled, how refunds for cancelled orders work, and when we may cancel an order.',
  html: `<p>Last updated: ${POLICIES_UPDATED}</p>
<h2>Cancelling your order</h2>
<p>Because each piece is made to order, production can start soon after you order. You can cancel an order ${cancellationTiming}. To cancel, email ${email} or call ${phone} as soon as possible, with your order number.</p>
<ul>
<li><strong>Not yet in production:</strong> we cancel the order and refund you in full.</li>
<li><strong>Already in production or dispatched:</strong> we can’t cancel the order. Our <a href="/policies/refund-policy">refund policy</a> still applies if anything arrives damaged, defective or wrong.</li>
</ul>
<h2>Refunds for cancelled orders</h2>
<p>Refunds go back to your original payment method. We start the refund within 7 working days of the cancellation. How long it takes to show in your account depends on your bank or payment provider.</p>
<h2>Cash on Delivery</h2>
<p>Cash on Delivery isn’t currently offered. If we introduce it, a Cash on Delivery order cancelled before dispatch will simply not be delivered, and there will be nothing to refund.</p>
<h2>When we may cancel</h2>
<p>We may cancel an order, with a full refund, if a product becomes unavailable, if there was a clear error in the price or product information, if we can’t deliver to your pin code, or if we suspect fraud. We’ll tell you by email.</p>
<h2>Contact</h2>
${contactBlock}`,
};

const privacy: Policy = {
  handle: 'privacy-policy',
  title: 'Privacy policy',
  description:
    'What personal information Trenzora collects, how it’s used and shared to deliver your order, and how to access, correct or delete it.',
  shopifyField: 'Privacy policy',
  html: `<p>Last updated: ${POLICIES_UPDATED}</p>
<p>This policy explains how ${businessName} (“Trenzora”, “we”) collects, uses and shares your personal information when you visit ${SITE.domain}, buy from us or contact us.</p>
<h2>Information you give us</h2>
<ul>
<li><strong>Order details:</strong> your name, email, phone number, shipping and billing address, and what you ordered.</li>
<li><strong>Messages:</strong> what you send us by email, phone or social media, including photos you send with a claim.</li>
<li><strong>Newsletter:</strong> your email address, if you sign up for updates.</li>
</ul>
<h2>Payments</h2>
<p>Payments are processed by Shopify’s checkout and the payment provider you choose there. We don’t see or store your full card or bank details.</p>
<h2>Information collected automatically</h2>
<p>When you browse the site, we and Shopify collect information about your device, browser, IP address and how you use the site, such as pages viewed and products added to your cart. We use Shopify’s built-in analytics to understand how the store is used. We don’t currently use third-party advertising or tracking tools such as Google Analytics or Meta Pixel. If we add them, we’ll update this policy first.</p>
<h2>Cookies</h2>
<p>We use cookies and similar technologies that keep the store working (for example, your cart and checkout) and that measure how the store is used. You can block or delete cookies in your browser settings, but the cart and checkout may not work properly without them.</p>
<h2>How we use your information</h2>
<ul>
<li>to process, make, ship and support your order;</li>
<li>to reply to your messages and handle claims and refunds;</li>
<li>to send newsletters, only if you’ve signed up (each email has an unsubscribe link);</li>
<li>to keep the store secure, prevent fraud and improve the site;</li>
<li>to meet legal, tax and accounting requirements.</li>
</ul>
<h2>Who we share it with</h2>
<ul>
<li><strong>Shopify</strong>, which hosts our store and checkout. See <a href="https://www.shopify.com/legal/privacy" rel="noopener noreferrer">Shopify’s privacy policy</a>.</li>
<li><strong>Payment providers</strong>, to process your payment.</li>
<li><strong>Production and delivery partners</strong>, who make and ship your order. They receive the details needed for that: your name, address, phone number and the products ordered.</li>
<li><strong>Authorities</strong>, where the law requires it.</li>
</ul>
<p>We don’t sell your personal information.</p>
<h2>How long we keep it</h2>
<p>We keep order information for as long as needed to fulfil and support your order, and to meet legal, tax and accounting requirements. We keep newsletter details until you unsubscribe.</p>
<h2>Security</h2>
<p>We use Shopify’s secure, encrypted checkout and limit who can access your information. No method of storing or sending data is completely secure, so we can’t guarantee absolute security.</p>
<h2>Your choices and rights</h2>
<p>You can ask us to access, correct or delete your personal information, or withdraw consent you’ve given (for example, to newsletters). Email ${email}. We may need to verify your identity first, and we may need to keep some information where the law requires it.</p>
<h2>Children</h2>
<p>Our store is meant for adults. If you’re under 18, please use it with a parent or guardian’s involvement.</p>
<h2>Changes to this policy</h2>
<p>We may update this policy. The date at the top shows when it last changed.</p>
<h2>Contact and grievances</h2>
<p>For privacy questions or complaints, email ${email} or call ${phone}.${BUSINESS.grievanceOfficer ? ` Grievance Officer: ${BUSINESS.grievanceOfficer.name}, ${BUSINESS.grievanceOfficer.designation}.` : ''}</p>
<p>${businessName}, ${address}.</p>`,
};

const terms: Policy = {
  handle: 'terms-of-service',
  title: 'Terms of service',
  description:
    'The terms for using trenzora.in and buying from Trenzora: orders, pricing, payment, delivery, returns and intellectual property.',
  shopifyField: 'Terms of service',
  html: `<p>Last updated: ${POLICIES_UPDATED}</p>
<p>These terms apply when you use ${SITE.domain} or buy from ${businessName} (“Trenzora”, “we”). By using the site or placing an order, you agree to them. Please also read our <a href="/shipping">shipping policy</a>, <a href="/policies/refund-policy">refund policy</a>, <a href="/policies/cancellation-policy">cancellation policy</a> and <a href="/policies/privacy-policy">privacy policy</a>, which form part of these terms.</p>
<h2>Using the site</h2>
<p>You may use the site to browse and buy for personal use. Don’t misuse it: for example, don’t try to disrupt it, gain unauthorised access, scrape it, or use it for anything unlawful.</p>
<h2>Products</h2>
<p>Our products are made to order. We describe and show them as accurately as we can, but colours and print placement can look slightly different on screens and vary slightly between pieces. Sizes are approximate, so please check the size details on each product page.</p>
<h2>Prices</h2>
<p>Prices are in Indian rupees (₹) and include applicable taxes. Shipping is free on all orders delivered in India. If a product is listed at a clearly wrong price, we may cancel the order and refund you in full.</p>
<h2>Orders</h2>
<p>Your order is an offer to buy. We accept it when we confirm it by email. We may decline or cancel an order, with a full refund, as described in our cancellation policy.</p>
<h2>Payment</h2>
<p>Payments are processed through Shopify’s checkout using the payment methods shown there. Your order is confirmed only once the payment is successful.</p>
<h2>Delivery</h2>
<p>We currently deliver within India only. Delivery times are estimates, as set out in our shipping policy.</p>
<h2>Returns and refunds</h2>
<p>Damaged, defective, misprinted or wrong items are covered by our refund policy. We don’t accept returns for change of mind or a size chosen by mistake. Nothing in these terms affects your rights under Indian consumer law.</p>
<h2>Intellectual property</h2>
<p>All Trenzora designs, artwork, text, photos and logos on the site belong to Trenzora. You may not copy, reproduce or sell them without our written permission. Buying a product gives you the product, not the rights to its design.</p>
<h2>Third-party services</h2>
<p>The store runs on Shopify, and payments and deliveries are handled by third-party providers under their own terms. The site may link to other websites, such as Instagram, which we don’t control.</p>
<h2>Liability</h2>
<p>To the extent the law allows, our total liability for any claim about an order is limited to the amount you paid for it, and we’re not liable for indirect or consequential losses. Nothing in these terms limits liability that can’t be limited under applicable law.</p>
<h2>Changes</h2>
<p>We may update these terms. The version on the site when you place your order applies to that order.</p>
<h2>Governing law</h2>
<p>These terms are governed by the laws of India.</p>
<h2>Contact and grievances</h2>
${contactBlock}`,
};

const contactInfo: Policy = {
  handle: 'contact-information',
  title: 'Contact information',
  description: 'How to contact Trenzora customer support.',
  shopifyField: 'Contact information',
  html: `<p><strong>${businessName}</strong></p>
<p>${address}</p>
<p>Email: ${email}<br />Phone: ${phone}${hours}</p>
${grievance}`,
};

/** Policies rendered at /policies/<handle>; shipping renders at /shipping. */
export const POLICIES: Policy[] = [
  shipping,
  refund,
  cancellation,
  privacy,
  terms,
];

/** Everything for Shopify's native policy fields (npm run policies:export). */
export const SHOPIFY_POLICIES: Policy[] = [
  refund,
  privacy,
  terms,
  shipping,
  contactInfo,
];

export function getPolicy(handle: string) {
  return POLICIES.find((policy) => policy.handle === handle);
}
