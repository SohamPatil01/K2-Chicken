# K2 Chicken

Fresh halal chicken delivery website for Pune — order online, get same-day delivery to your doorstep.

**Live areas:** Pimple Nilakh, Baner, Pancard Club, Aundh, and Wakad

## What this project does

- **Landing page** — K2 brand design with hero, product catalog, promotions, reviews, FAQ, and contact
- **Online ordering** — Browse cuts, pick weight options, add to cart, and checkout
- **Delivery** — Area checker, distance-based delivery charge, time slots, and address map picker
- **Customer accounts** — Login, OTP verification, order history, and saved addresses
- **Payments** — Cash on delivery and UPI (QR code)
- **Admin panel** — Manage products, stock, orders, promotions, inventory, and settings
- **WhatsApp** — Order notifications and chatbot integration
- **SEO** — Local metadata, structured data, sitemap, and robots.txt

## Tech stack

Next.js 14 · React · TypeScript · Tailwind CSS · PostgreSQL

## Quick start

```bash
git clone https://github.com/SohamPatil01/K2-Chicken.git
cd K2-Chicken
npm install
```

Create `.env.local` with your database, Google Maps, admin, and UPI credentials. See `SETUP_GUIDE.md` for full details.

```bash
node scripts/setup-database.js   # first-time DB setup
npm run dev                      # runs on http://localhost:3001
```

## Main pages

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/products/[id]` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Place order |
| `/orders` | Order history |
| `/login` | Customer login |
| `/admin` | Admin dashboard |

## Project by Soham Patil

Built as a full-stack e-commerce platform for a local fresh chicken delivery business — from storefront and checkout to admin tools and delivery logistics.
