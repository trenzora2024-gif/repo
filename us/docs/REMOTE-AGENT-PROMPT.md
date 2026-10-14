# Prompt for a browser-based Claude session (Shopify admin, Trendsi)

Copy everything below the line into the Claude session that can use your browser (Claude in Chrome or computer use). Sign in to Shopify admin for **trenzora.com** and to Trendsi first.

---

You are helping me finish the launch setup of my Shopify store **trenzora.com**. It is a US store selling size-inclusive women's jeans (Judy Blue and RISEN, sizes 0–24W) and cozy tops, fulfilled through the Trendsi app. Work in my signed-in browser.

**Ground rules (do not break these):**
- Work only in the store trenzora.com. If you land in any other store (for example MaternEase), stop and tell me.
- Do **not** delete products, orders, customers, collections, themes or pages. Hide or unpublish instead.
- Do **not** change payment settings, billing, plans, shipping rates, markets, taxes, domains, or the Meta/Google channel connections.
- Do **not** install paid apps or start paid trials. Free apps only, and only the ones named below.
- Do **not** create or launch any ad campaigns. Do **not** place orders.
- Do **not** add fake reviews, "X sold" counters, countdown timers or compare-at ("was") prices.
- Never mention dropshipping or suppliers (Trendsi, Doba) in anything customers can see.
- Before any irreversible step, or if something looks different from what I describe, stop and ask me.
- At the end, give me a checklist of what you did, what you skipped and why, plus a screenshot of each finished screen.

## Task 1: Review the new theme, then publish it (most urgent)

The live theme still shows old wording ("Free shipping on orders $40+", "30-day returns", home and garden categories), which contradicts the new policies.

1. Open https://trenzora.com/?preview_theme_id=158927618188. Check it at desktop width and at phone width.
2. The following must be true. Report anything that is wrong instead of publishing:
   - The homepage hero reads "Jeans that fit. Sizes 0–24W."
   - The menu reads Jeans That Fit · Bootcut · Straight · Wide Leg · Cozy Layers · Fit Guide.
   - Nowhere on the site says "30-day", "$40" or "garden".
   - A product page shows "Free US shipping on every order" and "14-day returns".
   - The cart page shows "Free US shipping on every order".
3. If everything checks out, go to **Online Store → Themes**. Find **"Denim launch - REVIEW BEFORE PUBLISH"** and click **Publish**. Do not delete the old theme ("theme-export-trenzora").
4. Reload https://trenzora.com in a private window and confirm the new homepage is live.

## Task 2: Legal policies (Settings → Policies)

1. **Refund policy:** replace the whole text with the content of the page https://trenzora.com/pages/returns-policy. Open that page and copy its full body text, keeping the headings and bullet lists. Save.
2. **Shipping policy:** replace the whole text with the content of https://trenzora.com/pages/shipping-policy. Save.
3. **Contact information:** remove the text "( Only For Documentation)" after the address. Leave everything else unchanged. Save.
4. **Terms of service:**
   - Find each "[LINK]" placeholder and replace it with the matching link: refund → `/policies/refund-policy`, shipping → `/policies/shipping-policy`, privacy → `/policies/privacy-policy`.
   - Change any link to `/pages/returns-policy` to `/policies/refund-policy`.
   - Do not change any other wording, and show me the before and after of each change. Save.
5. Open https://trenzora.com/policies/refund-policy and https://trenzora.com/policies/shipping-policy and confirm they show "14 days" and "Free US shipping on every order".

## Task 3: Homepage title for Google (Online Store → Preferences)

- Homepage title: `Trenzora | Jeans That Fit, Sizes 0–24W | Free US Shipping`
- Homepage meta description: `Tummy-control and high-rise jeans from Judy Blue and RISEN in sizes 0–24W, plus cozy layers. Free US shipping on every order and 14-day returns.`
- Save. Do not change anything else on that page (it also contains the Google/Meta pixel and password settings).

## Task 4: Hide the old, empty collections

Go to Products → Collections. For each of these collections, open it, find **Publishing / Sales channels**, and **remove only the Online Store channel**. Do not delete them.

Home · Garden · Outdoor · Tools & DIY · Garden & Outdoor · Workshop & Tools · Cleaning & Maintenance · Home & Kitchen · Featured Smart Finds · New & Trending

Do **not** touch: Home page, Jeans That Fit, Bootcut Jeans, Straight Leg Jeans, Wide Leg Jeans, Cozy Layers, Bundles.

## Task 5: Trendsi app settings (Shopify admin → Apps → Trendsi)

1. Find the pricing settings (price rule, price markup, auto-update price, or sync price). **Turn off** any automatic price updates or price rules that would overwrite my Shopify prices or set "compare-at" prices. Screenshot before and after.
2. Keep **inventory sync on**.
3. Check whether **auto-checkout / auto-fulfilment** is on, and whether a payment card is on file. **Do not add a card or change billing.** Just report the status.
4. Report whether Trendsi asks for a seller's permit or tax ID. Do not upload anything.
5. For product "Judy Blue Tummy Control Bootcut Jeans with Embroidered Back Pockets", report the stock that Trendsi shows per size. Shopify shows most sizes from 0 to 9 at 0, although Trendsi's site listed about 750 units.

## Task 6: Bundles (free Shopify Bundles app)

1. Install the free **Shopify Bundles** app, published by Shopify. If it shows any charge, stop and ask me.
2. Create 3 fixed bundles. The second item in each lets the customer choose its own size.
   - "Bootcut Jeans + Floral Sleeve Top": components "Judy Blue Tummy Control Bootcut Jeans with Embroidered Back Pockets" + "Umgee Boxy Top with 3D Floral Sleeves". Price **$119.99**.
   - "Bootcut Jeans + Christmas Sweater": Bootcut + "SO ME Sequin Bow Christmas Sweater". Price **$109.99**.
   - "Bootcut Jeans + Fleece Sweatshirt": Bootcut + "Zenana Fleece Hi-Low Boyfriend Sweatshirt with Pockets". Price **$94.99**.
   - No compare-at price on any bundle.
3. Give each bundle product the tag `bundle`, product type "Bundles", and a short description:
   - First line: "Free US shipping · arrives in 3–7 business days · 14-day returns".
   - Then one line saying it includes both pieces, and that size charts are on each item's own page.
4. Make sure each bundle is published to Online Store.
5. Then, for the **Bundles** collection (handle `bundles`), add the **Online Store** sales channel.
6. In **Online Store → Navigation → Main menu**, add "Bundles", linking to the Bundles collection, after "Cozy Layers".

## Task 7: Shopify Email (free automations)

In **Marketing → Automations**, using Shopify's own templates and the free Shopify Email allowance:

1. Turn on **Abandoned checkout**: one email, sent 1 hour after the checkout is abandoned. Subject: `Still deciding on your size?` Body: a short, friendly reminder that links to the Fit Guide (https://trenzora.com/pages/fit-guide) and mentions free US shipping and 14-day returns. **No discount code.**
2. Turn on **Welcome new subscribers** (one email). Subject: `Welcome to Trenzora – jeans that fit, sizes 0–24W`. Body: link to Jeans That Fit and the Fit Guide. **No discount code.**
3. Do not send any one-off email campaign.

## Task 8: Final check

1. In a private window, open trenzora.com on a phone-sized screen. Check the homepage, a jeans product page, the Fit Guide and the cart.
2. Add one item to the cart and go to checkout. Enter a US test address (for example 1500 Marilla St, Dallas, TX 75201).
3. Confirm that shipping shows **$0.00 "Free US Shipping (3–7 business days)"** and that tax is shown separately. **Stop before paying.**
4. Report anything that still shows old home and garden content, "$40", "30-day", or the word Trendsi, Doba or dropshipping.
