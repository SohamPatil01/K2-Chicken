const TRUST_ITEMS = [
  "🌿 Halal Certified",
  "❄️ Never Frozen",
  "⚡ 90-Min Delivery",
  "🧪 Lab Tested, Chemical-Free",
  "🔪 Master Butcher Cuts",
  "📦 Batch-Coded & Traceable",
];

function TrustTrack() {
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];
  return (
    <>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center gap-3.5">
          {item}
          <span className="text-k2-saffron text-lg" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </>
  );
}

export default function TrustBar() {
  return (
    <div
      className="overflow-hidden border-t border-k2-cream/10 bg-k2-green-deep py-4 text-k2-cream"
      aria-hidden="true"
    >
      <div className="marquee-track animate-marquee-slow font-display text-base font-semibold">
        <TrustTrack />
        <TrustTrack />
      </div>
    </div>
  );
}
