# Data Migration Guide

This guide helps you migrate data from your local PostgreSQL database to your cloud database (Neon/Supabase/Railway).

## Prerequisites

1. **Local database** must be running and accessible
2. **Cloud database** must be set up and `DATABASE_URL` must be in `.env.local`
3. **Both databases** should have the same schema (run initialization first)

## Step 1: Ensure Cloud Database Schema is Ready

Before migrating data, make sure your cloud database has all the tables:

```bash
# Run the migration to add missing columns
curl "https://k2-chicken.vercel.app/api/admin/migrate-db?token=your-token"

# Or re-run full initialization
curl "https://k2-chicken.vercel.app/api/admin/init-db?token=your-token"
```

## Step 2: Set Up Environment Variables

Make sure your `.env.local` has both:

```env
# Local database (source)
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=chicken_vicken
POSTGRES_PASSWORD=your_local_password
POSTGRES_PORT=5432

# Cloud database (destination)
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
```

## Step 3: Run the Migration Script

```bash
node scripts/migrate-data-to-cloud.js
```

The script will:
- ✅ Connect to both local and cloud databases
- ✅ Export data from local database
- ✅ Import data to cloud database
- ✅ Skip duplicates (won't create duplicate records)
- ✅ Show progress for each table
- ✅ Display a summary at the end

## What Gets Migrated

The script migrates data from these tables (in order):
1. `products` - All your products
2. `users` - User accounts
3. `user_addresses` - Saved addresses
4. `recipes` - Recipe data
5. `promotions` - Promotional offers
6. `settings` - App settings
7. `delivery_time_slots` - Delivery time slots
8. `product_weight_options` - Product weight options
9. `inventory` - Inventory data
10. `orders` - All orders
11. `order_items` - Order items
12. `whatsapp_sessions` - WhatsApp sessions
13. `whatsapp_orders` - WhatsApp orders
14. `whatsapp_order_items` - WhatsApp order items
15. `whatsapp_message_logs` - WhatsApp message logs
16. `inventory_history` - Inventory history

## Troubleshooting

### Error: "DATABASE_URL not found"
- Make sure `DATABASE_URL` is set in `.env.local`
- Get it from your cloud database provider (Neon/Supabase/Railway)

### Error: "Cannot connect to local database"
- Make sure PostgreSQL is running locally
- Check your local database credentials in `.env.local`

### Error: "Table doesn't exist"
- Run the database initialization/migration first on the cloud database
- The script will skip tables that don't exist

### Duplicate Key Errors
- The script handles duplicates automatically
- It uses `ON CONFLICT DO NOTHING` to skip duplicates

## Alternative: Manual Migration

If you prefer to migrate specific tables only, you can modify the `tables` array in the script to include only the tables you need.

## After Migration

1. **Verify data** in your cloud database
2. **Test your app** at https://k2-chicken.vercel.app
3. **Check products** are showing correctly
4. **Test order placement** to ensure everything works

## Notes

- The script preserves existing data in the cloud database (won't delete)
- Duplicates are automatically skipped
- Foreign key relationships are maintained
- The script respects the order of tables to avoid foreign key violations

