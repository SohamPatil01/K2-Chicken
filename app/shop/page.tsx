import { redirect } from "next/navigation";

type Props = { searchParams: { category?: string; search?: string } };

export default function ShopPage({ searchParams }: Props) {
  const category = searchParams?.category ? `category=${encodeURIComponent(searchParams.category)}` : "";
  const search = searchParams?.search ? `search=${encodeURIComponent(searchParams.search)}` : "";
  const q = [category, search].filter(Boolean).join("&");
  redirect(q ? `/?${q}#products` : "/#products");
}
