import Link from "next/link";
import Image from "next/image";

interface HeroProduct {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
  weightOptions?: { weight: string; price: number; is_default?: boolean }[];
}

interface HeroProps {
  deliveryEnabled?: boolean;
  freeDeliveryAbove?: number;
  heroProducts?: HeroProduct[];
}

const FALLBACK_PRODUCTS: HeroProduct[] = [
  { id: 0, name: "Chicken Breast", price: 289, category: "boneless" },
  { id: 0, name: "Whole Chicken", price: 259, category: "whole bird" },
  { id: 0, name: "Chicken Drumsticks", price: 249, category: "with bone" },
];

const FALLBACK_IMAGES = [
  "https://kimi-web-img.moonshot.cn/img/static.vecteezy.com/5339c9121c7a3481ddc70f0574454df60ebc1a6f.jpg",
  "https://kimi-web-img.moonshot.cn/img/5.imimg.com/fb727c0dea5b0f27e5a26035d675c74dba083be4.png",
  "https://kimi-web-img.moonshot.cn/img/assets.tendercuts.in/5fa64d1ab650743d25f21156c24dd0bef06a8edf.jpg",
];

function formatPrice(product: HeroProduct) {
  const defaultWeight = product.weightOptions?.find((w) => w.is_default) ?? product.weightOptions?.[0];
  const price = defaultWeight ? defaultWeight.price : product.price;
  const unit = defaultWeight ? `/${defaultWeight.weight}` : "/kg";
  return { price, unit };
}

export default function Hero({
  deliveryEnabled = true,
  freeDeliveryAbove = 350,
  heroProducts,
}: HeroProps) {
  const displayProducts = (heroProducts && heroProducts.length > 0 ? heroProducts : FALLBACK_PRODUCTS).slice(0, 3);
  const cardPositions = [
    "absolute top-0 right-0 w-60",
    "absolute top-36 left-0 w-60",
    "absolute bottom-8 right-8 w-60",
  ];
  const delays = ["0s", "2s", "4s"];

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-white">
      {/* Background image with heavy white overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-fresh-simple.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          quality={55}
          sizes="100vw"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left text column */}
          <div className="space-y-6">
            {/* Fresh badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-semibold hero-text-reveal">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              100% Fresh Raw Chicken — Never Frozen, Never Cooked
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-[1.1] hero-text-reveal stagger-1">
              Farm Fresh <br />
              <span className="text-brand-red italic">Raw Chicken</span><br />
              Delivered Daily
            </h1>

            {/* Sub */}
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed hero-text-reveal stagger-2">
              Premium quality raw chicken cuts, hand-cleaned by master butchers and hygienically packed. Delivered fresh to your kitchen in Pune.
              {deliveryEnabled && freeDeliveryAbove > 0 && (
                <span className="block mt-2 font-semibold text-brand-red">Free delivery above ₹{freeDeliveryAbove}</span>
              )}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 hero-text-reveal stagger-3">
              <Link
                href="/#products"
                className="btn-primary px-8 py-4 rounded-full text-white font-semibold text-lg flex items-center gap-3"
              >
                Shop Fresh Cuts
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/#about"
                className="px-8 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-brand-red hover:text-brand-red transition-all text-lg flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Our Process
              </Link>
            </div>

          </div>

          {/* Right floating product cards (desktop only) */}
          <div className="hidden lg:block relative h-[500px]">
            {displayProducts.map((product, i) => {
              const { price, unit } = formatPrice(product);
              const imgSrc = product.image_url || FALLBACK_IMAGES[i] || "/hero-fresh-simple.png";
              const tag = product.category
                ? product.category.replace(/_/g, " ").toUpperCase()
                : "FRESH CUT";
              return (
                <div
                  key={product.id || i}
                  className={`${cardPositions[i]} bg-white rounded-2xl p-3 border border-gray-200 shadow-xl animate-float`}
                  style={{ animationDelay: delays[i] }}
                >
                  <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3">
                    <Image
                      src={imgSrc}
                      fill
                      sizes="240px"
                      className="object-cover"
                      alt={product.name}
                      unoptimized={imgSrc.startsWith("http")}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="fresh-tag text-[10px] font-bold px-2 py-0.5 rounded-full">FRESH</span>
                    <span className="cut-badge text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">{tag}</span>
                  </div>
                  <h3 className="font-serif text-sm text-gray-900 font-semibold">{product.name}</h3>
                  <p className="price-tag text-base">₹{price} <span className="text-xs text-gray-400 font-normal">{unit}</span></p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
