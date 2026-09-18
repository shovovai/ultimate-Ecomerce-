# WebHaat — E-Commerce Platform

WebHaat is a full-featured online store built with **Next.js 16**, **Sanity** (database + CMS), **Clerk** (login), and **Stripe** (card payments). It includes a customer storefront, a complete admin panel, and a staff (employee) portal for order fulfilment.

This document explains what the system does, where data is stored, how it is set up, and how to run it.

---

## Contents

1. [What's included](#1-whats-included)
2. [How it works (architecture)](#2-how-it-works-architecture)
3. [Database (Sanity)](#3-database-sanity)
4. [Requirements](#4-requirements)
5. [Installation & first run](#5-installation--first-run)
6. [Environment variables](#6-environment-variables)
7. [Getting the service credentials](#7-getting-the-service-credentials)
8. [Admin panel guide](#8-admin-panel-guide)
9. [Employee portal](#9-employee-portal)
10. [Branding & customization](#10-branding--customization)
11. [Deployment](#11-deployment)
12. [Security notes](#12-security-notes)
13. [Troubleshooting](#13-troubleshooting)
14. [Project structure](#14-project-structure)

---

## 1. What's included

### Storefront (customers)

- Product catalog with categories, brands, deals, search and filters (price, brand, category)
- Cart, wishlist, checkout with saved addresses
- Payments: **Stripe** (card), **Clerk** billing, and **Cash on Delivery**
- Customer account: orders, order tracking timeline, invoices, profile, notifications
- Reward and loyalty points, wallet (refund credit) and withdrawal requests
- Product reviews (verified purchases, admin moderation)
- Premium and Business account applications (business accounts get extra discount)
- Blog, FAQ, contact, help, privacy and terms pages
- Newsletter subscription and one-click unsubscribe page
- SEO: metadata, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`
- Announcement bar controlled from the admin panel

### Admin panel (`/admin`)

| Section | What it does |
| --- | --- |
| **Dashboard** | Revenue, orders, users and products with month-over-month change; pending account requests; quick actions |
| **Analytics** | Sales and revenue charts by period, order status and payment method breakdowns, best-selling products |
| **Reports & Export** | Customer insights (repeat rate, average order value, customer value, segments, top customers, top products, top cities, new customers per month) and **Excel/CSV export** of orders, customers, products, subscribers and reviews |
| **Orders** | Search, filter and update orders; assign employees; refunds to wallet; cancellations |
| **Products** | Browse, search and inspect the catalog (read-only). Create and edit products in Sanity Studio (`/studio`) |
| **Reviews** | Approve or reject customer reviews; product ratings are recalculated |
| **Users** | Customer list (Clerk + Sanity), details, activation, sync |
| **Account Requests** | Approve or reject Premium and Business account applications |
| **Email Marketing** | Compose and send newsletter campaigns (with test send and campaign history); manage and export subscribers |
| **Notifications** | Send in-app notifications to users and view sent history |
| **Employees** | Assign staff roles, suspend or activate staff, view performance |
| **Settings** | Admin panel title, logo and accent color; store name, support contact, currency symbol; storefront announcement bar |

### Employee portal (`/employee`)

Role-based order processing for staff: Call Center → Packer → Warehouse → Delivery → Accounts, plus an In-charge role with full access and team analytics. See [section 9](#9-employee-portal).

---

## 2. How it works (architecture)

```
             ┌────────────────────────────── Browser ──────────────────────────────┐
             │  Storefront  (/ , /shop, /product, /cart, /checkout, /user/...)    │
             │  Admin panel (/admin/...)      Employee portal (/employee)          │
             │  Sanity Studio (/studio)                                           │
             └───────────────┬─────────────────────────────────────┬──────────────┘
                             │                                     │
                 Next.js 16 App Router (server)                    │ Clerk (sign-in UI)
     ┌───────────────────────┼──────────────────────────┐         │
     │ Server components      API routes (/api/...)      │         │
     │ Server actions (/actions)   proxy.ts (auth guard) │         │
     └──────┬──────────────┬──────────────┬─────────────┘         │
            │              │              │                        │
      ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼──────┐  ┌──────────────▼─┐
      │  Sanity   │  │  Stripe   │  │ Gmail SMTP │  │     Clerk      │
      │ database  │  │ payments  │  │ (Nodemailer│  │ users/sessions │
      │ + images  │  │ + webhook │  │  OAuth2)   │  │                │
      └───────────┘  └───────────┘  └────────────┘  └────────────────┘
                                   Firebase Analytics (optional, browser events)
```

| Layer | Technology | Purpose |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript | Pages, API routes, server actions |
| Database / CMS | **Sanity Content Lake** | All store data: products, orders, users, reviews, settings… |
| Authentication | **Clerk** | Sign-up/sign-in, sessions, user profiles |
| Payments | **Stripe** Checkout + webhook, Clerk billing, Cash on Delivery | Taking payment |
| Email | Nodemailer via Gmail OAuth2 | Order confirmations, newsletters, campaigns |
| Analytics | Firebase Analytics (optional) | Browser event tracking |
| UI | Tailwind CSS 4, Radix UI (shadcn/ui), Framer Motion, Recharts | Styling, components, charts |
| State | Zustand | Cart and wishlist in the browser |

**Request flow example — placing an order**

1. The customer adds items to the cart (stored in the browser with Zustand).
2. At checkout the order is created in Sanity (`order` document, status `pending`).
3. Card payments go to Stripe Checkout. Stripe calls `/api/webhook` (`checkout.session.completed`), which marks the order as paid.
4. A confirmation email is sent through Nodemailer.
5. Staff move the order through the pipeline in `/employee`, and admins can follow it in `/admin/orders`.

**Who is an admin?** Any signed-in user whose email is listed in `NEXT_PUBLIC_ADMIN_EMAIL`. This is checked on the server for every admin page, admin API route and admin server action.

---

## 3. Database (Sanity)

WebHaat has no separate SQL/Mongo database. **Sanity is the database.** Data is stored as JSON documents in your Sanity project (hosted by Sanity) and queried with GROQ. Images are stored on Sanity's CDN (`cdn.sanity.io`).

- **Studio**: open `/studio` on your site to browse and edit all data directly (products, banners, blog posts, etc.).
- **Read client** (`sanity/lib/client.ts`): uses the CDN for public pages.
- **Write/back-end clients** (`sanity/lib/client.ts` → `writeClient`, `sanity/lib/backendClient.ts`): use `SANITY_API_TOKEN` on the server only.

### Document types (`sanity/schemaTypes/`)

| Type | Holds |
| --- | --- |
| `product` | Name, slug, images, description, price, discount, stock, categories, brand, status, variant, featured flag, rating stats |
| `category`, `brand` | Catalog taxonomy |
| `order` | Order number, customer, items, totals, address, status, payment status and method, Stripe/Clerk IDs, full employee tracking (who confirmed, packed, delivered, cash collected…) and status history |
| `user` | Profile linked to Clerk (`clerkUserId`), addresses, preferences, cart, wishlist, reward and loyalty points, wallet balance and transactions, premium/business status, employee role, status and performance |
| `address` | Saved shipping addresses |
| `review` | Product reviews with rating, status (`pending`/`approved`/`rejected`) and admin notes |
| `subscription` | Newsletter subscribers (email, status, source) |
| `emailCampaign` | History of campaigns sent from the admin panel |
| `storeSettings` | Singleton with admin branding, store info and announcement bar |
| `sentNotification` | Notifications sent by admins |
| `userAccessRequest` | Access and approval requests |
| `banner`, `blog`, `blogcategory`, `author`, `blockContent` | Marketing and blog content |
| `contact` | Contact form submissions |

After changing a schema, regenerate TypeScript types:

```bash
npm run typegen
```

---

## 4. Requirements

- **Node.js 20+** (Node 22 LTS recommended)
- npm (or pnpm/yarn)
- Free accounts on: **Sanity**, **Clerk**, **Stripe**
- Optional: a Google account (for sending emails), Firebase (analytics)

---

## 5. Installation & first run

```bash
# 1. Get the code
git clone <your-repository-url> webhaat
cd webhaat

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
#    then fill in the values (see sections 6 and 7)

# 4. Start the development server
npm run dev
```

Open:

- Storefront → http://localhost:3000
- Admin panel → http://localhost:3000/admin (sign in with an email listed in `NEXT_PUBLIC_ADMIN_EMAIL`)
- Sanity Studio → http://localhost:3000/studio
- Employee portal → http://localhost:3000/employee

### First-time checklist

1. Sign up on the site with the email you put in `NEXT_PUBLIC_ADMIN_EMAIL`.
2. Open `/studio` and add at least one **category**, **brand**, and **product** (with an image and price).
3. In Sanity → **API → CORS origins**, add `http://localhost:3000` (and later your live domain) with *Allow credentials* checked.
4. Open `/admin/settings` and set your store name, colors, and currency.
5. Place a test order (Cash on Delivery works without Stripe webhooks).

### Production build

```bash
npm run build
npm start
```

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typegen` | Extract the Sanity schema and generate `sanity.types.ts` |

---

## 6. Environment variables

All settings live in `.env` (copy it from `.env.example`). **Never commit `.env`** — it is git-ignored.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | yes | Public site URL, e.g. `https://webhaat.com` (`http://localhost:3000` locally). Used for SEO, sitemap and email links |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | no | e.g. `2025-01-01` |
| `SANITY_API_TOKEN` | yes | Sanity token with **Editor** rights (server-only) |
| `SANITY_API_READ_TOKEN` | yes | Sanity token with **Viewer** rights (live content) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | yes | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `..._SIGN_UP_URL` | yes | `/sign-in` and `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` / `..._AFTER_SIGN_UP_URL` | yes | `/` |
| `STRIPE_SECRET_KEY` | yes* | Stripe secret key. *The build fails without it; use a test key if you only use Cash on Delivery |
| `STRIPE_WEBHOOK_SECRET` | for card payments | Signing secret of the `/api/webhook` endpoint |
| `NEXT_PUBLIC_ADMIN_EMAIL` | yes | Admin emails, comma-separated: `owner@shop.com,manager@shop.com` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `SENDER_EMAIL_ADDRESS` | for emails | Gmail OAuth2 used by Nodemailer |
| `NEXT_PUBLIC_COMPANY_NAME` | no | Store name (default `WebHaat`) |
| `NEXT_PUBLIC_COMPANY_EMAIL`, `NEXT_PUBLIC_COMPANY_PHONE`, `NEXT_PUBLIC_COMPANY_ADDRESS`, `NEXT_PUBLIC_COMPANY_CITY` | no | Contact details shown on the site |
| `NEXT_PUBLIC_COMPANY_BUSINESS_HOURS_WEEKDAY` / `_WEEKEND` | no | Opening hours text |
| `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SALES_EMAIL` | no | Contact emails |
| `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_TWITTER_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_YOUTUBE_URL` | no | Social links in the footer |
| `NEXT_PUBLIC_COMPANY_DESCRIPTION`, `NEXT_PUBLIC_COPYRIGHT_TEXT` | no | SEO description and footer copyright |
| `TAX_AMOUNT` | no | Tax rate as a decimal (e.g. `0.05` = 5%). Default `0` |
| `REWARD_POINTS_THRESHOLD`, `REWARD_POINTS_AMOUNT` | no | Reward points rules |
| `LOYALTY_POINTS_ORDER_THRESHOLD`, `LOYALTY_POINTS_AMOUNT` | no | Loyalty points rules |
| `NEXT_PUBLIC_FIREBASE_*` | no | Firebase Analytics config (browser event tracking) |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | no | Your own Google AdSense publisher ID (ads are off when empty) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Google Search Console verification code |

---

## 7. Getting the service credentials

### Sanity (database)

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) (or run `npm create sanity@latest`).
2. Copy the **Project ID** into `NEXT_PUBLIC_SANITY_PROJECT_ID`, and use dataset `production`.
3. **API → Tokens**: create one **Editor** token (`SANITY_API_TOKEN`) and one **Viewer** token (`SANITY_API_READ_TOKEN`).
4. **API → CORS origins**: add your local and live URLs with credentials allowed.

### Clerk (login)

1. Create an application at [clerk.com](https://clerk.com) and enable Email sign-in.
2. Copy the **Publishable key** and **Secret key** into `.env`.
3. In production, add your domain in Clerk and use the live keys.

### Stripe (card payments)

1. From [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys, copy the **Secret key** into `STRIPE_SECRET_KEY`.
2. Webhook: Developers → Webhooks → Add endpoint → `https://your-domain.com/api/webhook`, event **`checkout.session.completed`**. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

### Email (Gmail OAuth2 via Nodemailer)

1. In [Google Cloud Console](https://console.cloud.google.com) create an OAuth client (Web application) and enable the Gmail API.
2. Add `https://developers.google.com/oauthplayground` as an authorized redirect URI.
3. In the [OAuth Playground](https://developers.google.com/oauthplayground), use your own client ID/secret, authorize `https://mail.google.com/`, and exchange the code for a **refresh token**.
4. Fill `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, and `SENDER_EMAIL_ADDRESS` (the Gmail address).

> Gmail limits sending to about 500 emails per day (2,000 for Google Workspace). For larger newsletters, point the Nodemailer transporter in `lib/emailService.ts` at an SMTP provider such as SendGrid, Mailgun, Amazon SES or Brevo.

### Firebase Analytics (optional)

Create a Firebase project, add a Web app, and copy its config into the `NEXT_PUBLIC_FIREBASE_*` variables.

---

## 8. Admin panel guide

**Access:** add the owner's email to `NEXT_PUBLIC_ADMIN_EMAIL`, restart the server, sign in with that email, and open `/admin`. Other users are sent to `/admin/access-denied`.

- **Dashboard** — daily overview. Cards link to the matching sections.
- **Analytics** — choose a period to see revenue and sales trends, order status and payment breakdowns, and best sellers.
- **Reports & Export**
  - Pick a range (30 days, 90 days, 12 months, or all time) for customer insights.
  - *Export data*: choose optional From/To dates, then click Orders, Customers, Products, Subscribers or Reviews. A `.csv` file downloads and opens directly in Excel or Google Sheets.
- **Orders** — open an order to change its status, assign staff, or refund to the customer's wallet.
- **Reviews** — the *Pending* tab lists new reviews. Approve to publish or reject with a note.
- **Account Requests** — approve Premium or Business applications. The sidebar badge shows how many are pending.
- **Email Marketing**
  1. Write the subject and message (leave a blank line between paragraphs). The button text and link are optional.
  2. Click **Send test to me** to preview in your inbox.
  3. Click **Send to all subscribers**. Every email includes an unsubscribe link (`/newsletter/unsubscribe`).
  4. The subscriber table below supports search, filters, delete and CSV export.
- **Employees** — pick a registered user and assign a role. Suspend or activate staff at any time.
- **Settings** — panel title, logo URL, accent color, store name, currency symbol, support contact, and the storefront announcement bar. Changes apply immediately.

---

## 9. Employee portal

Staff sign in normally and open **`/employee`** (also linked in their account menu). Each role sees only the orders it works on:

| Role | Responsibilities |
| --- | --- |
| `callcenter` | Confirm the customer's address, then confirm the order |
| `packer` | Pack confirmed orders |
| `warehouse` | Assign packed orders to a delivery person |
| `deliveryman` | Start delivery, mark delivered or failed, reschedule, collect cash |
| `accounts` | Receive cash from delivery staff; view payment analytics |
| `incharge` | Can perform every step; view team analytics |

Every action is recorded on the order (who did it and when) and in its status history. Customers are notified as the status changes.

---

## 10. Branding & customization

| What | Where |
| --- | --- |
| Store name, description, URL, social links (code defaults) | `config/brand.ts` (or the matching env variables) |
| Contact page details | `config/contact.ts` / env variables |
| Logo in header and footer | `components/common/Logo.tsx` |
| Theme colors | `app/globals.css` (`--color-shop_dark_green`, `--color-shop_light_green`, `--color-shop_orange`, …) |
| Admin title, logo, accent color, announcement bar | **Admin → Settings** (no code needed) |
| FAQ content | `constants/index.ts` |
| About / Terms / Privacy pages | `app/(client)/(public)/...` |
| Email templates | `lib/emailService.ts`, `app/api/newsletter/subscribe/route.ts` |
| Open Graph image | add `public/og-image.jpg` (1200×630) |

---

## 11. Deployment

### Vercel (recommended)

1. Push the code to a private Git repository.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add all variables from your `.env` in **Project → Settings → Environment Variables**, and set `NEXT_PUBLIC_BASE_URL` to your live domain.
4. Deploy, then:
   - Add the domain to Sanity CORS origins and to Clerk (production instance).
   - Create the Stripe webhook for `https://your-domain.com/api/webhook`.

### Any Node.js host (VPS, Railway, Render…)

```bash
npm ci
npm run build
npm start          # listens on port 3000 (use PORT=8080 npm start to change)
```

Run it behind a reverse proxy (Nginx or Caddy) with HTTPS, and use a process manager such as `pm2`.

---

## 12. Security notes

- Admin rights come only from `NEXT_PUBLIC_ADMIN_EMAIL`. Every `/api/admin/*` route calls `requireAdmin()` (`lib/adminAuth.ts`), and the admin layout verifies the user on the server.
- Employee-management server actions check that the caller is an admin, and order-processing actions check the employee's role.
- Wallet credits can only be added from server code (`lib/walletCredit.ts`). They cannot be triggered from the browser.
- CSV exports neutralize spreadsheet formulas to prevent CSV injection.
- Keep `SANITY_API_TOKEN`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY` and the Google secrets private. If they were ever committed to git or shared, **rotate them** in each provider's dashboard.

---

## 13. Troubleshooting

| Problem | Fix |
| --- | --- |
| `Missing environment variable: NEXT_PUBLIC_SANITY_...` | Fill in the Sanity variables in `.env` and restart |
| Build error `STRIPE_SECRET_KEY is not set` | Add a Stripe key (a test key works) |
| `/admin` redirects to access-denied | Your sign-in email must be listed exactly in `NEXT_PUBLIC_ADMIN_EMAIL`. Restart after changing `.env` |
| Products don't appear | Publish them in `/studio`, and check CORS origins and the dataset name |
| Orders stay unpaid after Stripe payment | Check the webhook URL (`/api/webhook`) and `STRIPE_WEBHOOK_SECRET`. Locally, run `stripe listen` |
| Emails not sent | Check the Google OAuth variables. Refresh tokens from an OAuth app in "Testing" mode expire after 7 days, so publish the app |
| Stale data or odd build errors | Delete the `.next` folder and restart |

---

## 14. Project structure

```
app/
  (client)/            Storefront pages (shop, product, cart, checkout, user account, blog…)
  (auth)/              Clerk sign-in / sign-up pages
  (admin)/admin/
    (panel)/           Admin pages (server-guarded layout + AdminShell sidebar)
    access-denied/
  (employee)/employee/ Employee portal
  api/                 API routes (admin/*, orders, checkout, webhook, newsletter, user…)
  studio/              Embedded Sanity Studio
actions/               Server actions (orders, employees, wallet, reviews, users…)
components/
  admin/               Admin UI (AdminShell, dashboards, reports, settings, campaigns…)
  ui/                  shadcn/ui primitives
config/                brand.ts, contact.ts
lib/                   adminAuth, storeSettings, emailService, seo, cache, points…
sanity/                Schema types, GROQ queries, Sanity clients
docs/                  Extra technical notes (employee system, reviews, caching, SEO…)
proxy.ts               Clerk middleware (auth for protected routes)
```

---

© WebHaat. All rights reserved.
