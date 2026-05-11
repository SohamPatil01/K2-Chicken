import { cache } from "react";
import pool from "@/lib/db";

export type ProductForSeo = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  category: string | null;
  is_available: boolean;
};

/** Deduped per request — used by product layout metadata + JSON-LD. */
export const getProductForSeo = cache(
  async (id: string): Promise<ProductForSeo | null> => {
    if (!/^\d+$/.test(id)) return null;
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT id, name, description, price, image_url, category, is_available
           FROM products WHERE id = $1`,
          [id]
        );
        return result.rows[0] ?? null;
      } finally {
        client.release();
      }
    } catch {
      return null;
    }
  }
);
