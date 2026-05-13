import type { Product, WeightOption } from "@/context/CartContext";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapWeightOption(row: any): WeightOption {
  return {
    id: row.id,
    weight: toNumber(row.weight),
    weight_unit: row.weight_unit || "g",
    price: toNumber(row.price),
    is_default: !!row.is_default,
  };
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    price: toNumber(row.price),
    image_url: row.image_url || "",
    category: row.category || "",
    is_available: row.is_available,
    stock_quantity: toNumber(row.stock_quantity ?? 100),
    low_stock_threshold: toNumber(row.low_stock_threshold ?? 10),
    in_stock: row.in_stock ?? true,
    ...(row.original_price
      ? { original_price: toNumber(row.original_price) }
      : {}),
  } as Product & { original_price?: number };
}

async function attachWeightOptions(
  client: any,
  products: Product[]
): Promise<Product[]> {
  if (products.length === 0) return products;

  try {
    const ids = products.map((product) => product.id);
    const result = await client.query(
      `
      SELECT id, product_id, weight, weight_unit, price, COALESCE(is_default, false) AS is_default
      FROM product_weight_options
      WHERE product_id = ANY($1::int[])
      ORDER BY product_id, weight
      `,
      [ids]
    );

    return products.map((product) => {
      const weightOptions = result.rows
        .filter((row: any) => row.product_id === product.id)
        .map(mapWeightOption);

      return {
        ...product,
        weightOptions:
          weightOptions.length > 0
            ? weightOptions
            : [
                {
                  id: null,
                  weight: 500,
                  weight_unit: "g",
                  price: product.price,
                  is_default: true,
                },
              ],
      };
    });
  } catch {
    return products.map((product) => ({
      ...product,
      weightOptions: [
        {
          id: null,
          weight: 500,
          weight_unit: "g",
          price: product.price,
          is_default: true,
        },
      ],
    }));
  }
}

async function getProductPageData(id: string): Promise<{
  product: Product | null;
  reviews: Review[];
  relatedProducts: Product[];
}> {
  const client = await pool.connect();
  try {
    const productResult = await client.query(
      `
      SELECT
        id,
        name,
        description,
        price,
        COALESCE(original_price, price) AS original_price,
        image_url,
        category,
        is_available,
        COALESCE(stock_quantity, 100) AS stock_quantity,
        COALESCE(low_stock_threshold, 10) AS low_stock_threshold,
        COALESCE(in_stock, true) AS in_stock
      FROM products
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (productResult.rows.length === 0) {
      return { product: null, reviews: [], relatedProducts: [] };
    }

    const [product] = await attachWeightOptions(client, [
      mapProduct(productResult.rows[0]),
    ]);

    const [reviewsResult, relatedResult] = await Promise.all([
      client.query(`
        SELECT id, user_name, rating, comment
        FROM reviews
        WHERE is_approved = true
        ORDER BY is_featured DESC, display_order ASC, created_at DESC
        LIMIT 3
      `),
      client.query(
        `
        SELECT
          id,
          name,
          description,
          price,
          COALESCE(original_price, price) AS original_price,
          image_url,
          category,
          is_available,
          COALESCE(stock_quantity, 100) AS stock_quantity,
          COALESCE(low_stock_threshold, 10) AS low_stock_threshold,
          COALESCE(in_stock, true) AS in_stock
        FROM products
        WHERE is_available = true
          AND category = $1
          AND id <> $2
        ORDER BY name
        LIMIT 4
        `,
        [product.category, product.id]
      ),
    ]);

    const relatedProducts = await attachWeightOptions(
      client,
      relatedResult.rows.map(mapProduct)
    );

    return {
      product,
      reviews: reviewsResult.rows,
      relatedProducts,
    };
  } finally {
    client.release();
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { product, reviews, relatedProducts } = await getProductPageData(
    params.id
  );

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      reviews={reviews}
      relatedProducts={relatedProducts}
    />
  );
}
