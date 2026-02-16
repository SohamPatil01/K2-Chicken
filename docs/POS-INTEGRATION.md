# POS Integration Guide – K2 Chicken Website

Yes, you can connect this website with your POS system. Below is what your site already exposes and how to hook a POS to it.

## What the website already has

- **PostgreSQL** – Orders, order items, products, product weight options, inventory.
- **REST APIs** – Orders (create, list, get by id), products, inventory (read/update).
- **Order flow** – Customer places order on site → stored in DB → WhatsApp notification (optional).

## Integration options

### 1. **Website → POS (push new orders to POS)**

When a customer places an order on the website, your backend can push that order to the POS.

- **You need:** POS vendor’s API (e.g. webhook URL or “create order” endpoint) and API key.
- **Flow:** After saving the order in your DB (in `app/api/orders/route.ts`), call the POS API with order details (customer, items, total, etc.).
- **Next step:** Tell us which POS you use (e.g. Square, Toast, Posist, BharatPos, or custom), and we can add the exact API call and mapping in the order-creation code.

### 2. **POS → Website (POS pulls new orders from website)**

POS polls your backend for new/pending orders and imports them.

- **You need:** A dedicated API that returns “pending” (or “new”) orders in a simple, stable format.
- **Flow:** POS calls e.g. `GET /api/pos/orders?status=pending` on a schedule; your API returns orders with items; POS creates local orders and can later call an endpoint to mark them as “received” so the website can update status.
- **Implemented:** `GET /api/pos/orders` is available (see below). Use it from your POS (with an API key or IP allowlist for security).

### 3. **Sync products / menu**

Keep product list and prices in sync between website and POS.

- **Website → POS:** Your site already has `GET /api/products` and product fields (name, price, category, weight options). POS can poll this and update its menu.
- **POS → Website:** If the POS is the source of truth, we can add an API like `POST /api/pos/products/sync` that accepts a list of products and updates your DB (and then the website shows updated menu/prices).

### 4. **Sync inventory**

Keep stock in sync so website doesn’t sell out-of-stock items.

- **Website → POS:** `GET /api/inventory` returns product-wise stock. POS can poll and update its inventory.
- **POS → Website:** Add an API like `POST /api/pos/inventory` that accepts updates from the POS; your site updates the `inventory` table (and optionally `products.in_stock` / `products.stock_quantity`).

## Security (important)

- Do **not** expose POS or order APIs publicly without protection. Use at least one of:
  - **API key** in a header (e.g. `x-pos-api-key`) and validate it in the API route.
  - **IP allowlist** so only your POS/server IP can call these endpoints.
- Keep the API key in `.env` (e.g. `POS_API_KEY`) and never commit it.

## What we need from you to implement

1. **POS name and model** (e.g. Square, Posist, BharatPos, custom).
2. **Direction of sync:**
   - Only “website orders → POS”?
   - Or also “POS pulls orders from website”?
   - Do you want product sync and/or inventory sync?
3. **POS API docs** (if you have them) – endpoint URLs, auth method, and sample request/response for creating an order (and optionally products/inventory).

Once you share this, we can add the exact integration (e.g. push to POS inside `app/api/orders/route.ts`, or extra POS sync endpoints and a small sync script).

## Quick reference – existing APIs

| Purpose          | Method | Endpoint             | Notes                         |
| ---------------- | ------ | -------------------- | ----------------------------- |
| Create order     | POST   | `/api/orders`        | Body: customer, items, total… |
| List orders      | GET    | `/api/orders/my`     | Needs auth (user’s orders).   |
| Get order by ID  | GET    | `/api/orders/[id]`   |                               |
| List products    | GET    | `/api/products`      | For menu sync.                |
| Get product      | GET    | `/api/products/[id]` |                               |
| List inventory   | GET    | `/api/inventory`     | For stock sync.               |
| Update inventory | PUT    | `/api/inventory`     | Body: product_id, quantity…   |

The new **POS-specific** endpoint is:

| Purpose           | Method | Endpoint          | Notes                                  |
| ----------------- | ------ | ----------------- | -------------------------------------- |
| List orders (POS) | GET    | `/api/pos/orders` | Query: `?status=pending`. Use API key. |

Use this for “POS pulls orders from website”. For “website pushes orders to POS”, we’ll add the call inside the order-creation flow once you share your POS details.
