# Trenzora.in on Meta: setup brief

Separate Meta presence for the India brand **trenzora.in**. Never touch Trenzora.fashion, Trenzora.com, MaternEase, or any other existing Page, account or business portfolio. No ads, no spending.

## Checked first (2026-10-04, read-only, via the owner's Meta login)

- Pages this login can use: NarvalCart (×2), Narvalcart.com, Narvalcart2024, cool_surajn, Wrencart, Avanis fashion creation, Moving forward Everyday, **Trenzora** (`491950360668226`), Modishcart, Theepicread, **Trenzora.fashion** (`871684232702524`), Zupetia, maternease. **No Trenzora.in / Trenzora India Page exists.** Leave "Trenzora" and "Trenzora.fashion" alone.
- Business portfolios: theepicread, zupetia, **Trenzora** (`1067912345194480`, owns the Trenzora.Fashion ad accounts), Modishcart, Not active, Wrencart, Sunidhi, Narvalcart India, Not active 2, Maternease India. To keep trenzora.in separate, use a **new** portfolio, not "Trenzora".
- The Instagram account the website used to link (`@trenzora.in`) is **not the owner's**. The website link has been removed until the new handle is confirmed.

## Profile details (use exactly)

| Field                  | Value                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business portfolio     | **Trenzora India** (new). If Meta refuses a new portfolio (account limit), stop and ask the owner.                                                 |
| Facebook Page name     | **Trenzora India**                                                                                                                                 |
| Page username          | first available: `trenzora.india`, `trenzoraindia`, `trenzora.in.official`                                                                         |
| Page category          | Clothing (Brand); add Shopping & retail if a second category is allowed                                                                            |
| Instagram username     | first available: `trenzora.india`, `trenzoraindia`, `trenzora.studio`, `madebytrenzora`. Never use or claim `trenzora.in` (owned by someone else). |
| Instagram name         | Trenzora India                                                                                                                                     |
| Instagram account type | Professional → Business, category Clothing (Brand)                                                                                                 |
| Website                | `https://trenzora.in`                                                                                                                              |
| Email                  | `support@trenzora.in` (the brand's support inbox everywhere else)                                                                                  |
| Phone                  | `+91 96196 57030` (from Shopify store details)                                                                                                     |
| Location               | Navi Mumbai, Maharashtra. Show city only; don't publish the street address.                                                                        |
| Profile picture (both) | `public/brand/social/trenzora-profile-1080.png`                                                                                                    |
| Facebook cover         | `public/brand/social/trenzora-facebook-cover-1640x624.png`                                                                                         |

**Instagram bio (136 / 150 characters):**

```
Made for people with personality.
Original-design tees, totes & tumblers.
Indian stories, printed to order.
Free shipping across India ↓
```

**Facebook intro (86 / 101 characters):**

```
Made for people with personality. Original-design tees, totes and tumblers from India.
```

**Facebook "About" / description:**

```
Trenzora is an Indian design brand making original-design oversized tees, totes and tumblers, made for people with personality. Every design is a Trenzora original, printed to order in India, with free shipping across India.
```

Don't say personalization is available (it's a future feature). Don't describe Trenzora as a print-on-demand marketplace, reseller or dropshipping store.

## Handoff prompt for Claude on the owner's computer

Paste this into the Claude desktop app (computer use) or Claude in Chrome, with this file and the two images on the computer:

```
Set up a NEW, separate Meta presence for my India brand Trenzora.in, in my own browser where I'm signed in. Follow docs/social/META-SETUP.md exactly (profile details, bio, images).

Rules:
- Never ask for or type my Facebook/Instagram password. When Meta asks for login, OTP, 2FA, identity verification, CAPTCHA or any security approval, stop and let me do it, then continue.
- Do not open, edit, rename, disconnect or post on any existing Page, Instagram account or business portfolio: especially "Trenzora", "Trenzora.fashion", "maternease", NarvalCart, Modishcart. Do not touch Trenzora.com.
- Do not create ads, boost posts, add payment methods or spend money.
- Before creating anything, check that a "Trenzora India" Page / portfolio and the chosen usernames don't already exist. If one exists and is mine, use it; never create duplicates.

Steps:
1. business.facebook.com → create business portfolio "Trenzora India" (business email support@trenzora.in, website https://trenzora.in).
2. In that portfolio, create Facebook Page "Trenzora India", category Clothing (Brand). Set username (first available from the brief), website, email, phone +91 96196 57030, location Navi Mumbai (city only), intro and About text, profile picture and cover from the brief.
3. Create a new Instagram account (first available username from the brief; never "trenzora.in"), switch it to Professional → Business, category Clothing (Brand). Set name "Trenzora India", bio, website, email, phone and the profile picture from the brief.
4. Connect the Instagram account to the "Trenzora India" Page (Page settings → Linked accounts → Instagram), and add both to the "Trenzora India" portfolio (Business settings → Accounts).
5. Verify and report: Page name, Page URL/username, Instagram username, website, email, phone, profile picture, bio, the Instagram ↔ Page connection, and that both sit in the "Trenzora India" portfolio with me as admin.
```

## After setup (back in the repo)

Tell Claude the final Instagram handle. It goes in `SITE.instagram` in `app/data/site.ts` (`{handle, url}`), which brings back the Instagram links in the footer, on the Contact page and on the homepage.
