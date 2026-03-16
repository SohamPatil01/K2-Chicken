"use client";

import { Tag } from "lucide-react";
import SectionHeader from "./SectionHeader";
import OfferBanner from "./OfferBanner";

export interface Promotion {
  id: number;
  title: string;
  description?: string;
  promo_code?: string;
  image_url?: string;
  discount_type?: string;
}

interface HomeOffersSectionProps {
  promotions: Promotion[];
}

export default function HomeOffersSection({ promotions }: HomeOffersSectionProps) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Offers"
          title="Save more with our promotions"
          subtitle="Current deals and discounts on fresh chicken and more."
          icon={Tag}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.slice(0, 6).map((promo) => (
            <OfferBanner
              key={promo.id}
              title={promo.title}
              description={promo.description ?? undefined}
              promoCode={promo.promo_code ?? undefined}
              imageUrl={promo.image_url ?? undefined}
              type={
                promo.discount_type === "free_delivery"
                  ? "free_delivery"
                  : promo.discount_type === "percentage" || promo.discount_type === "fixed"
                  ? "discount"
                  : "generic"
              }
              link="/#products"
              linkLabel="Shop now"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
