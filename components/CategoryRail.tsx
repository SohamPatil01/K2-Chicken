export default function CategoryRail() {
  return (
    <div className="rv mx-auto max-w-[1180px] px-6 pt-20 pb-2">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="section-eyebrow">Today&apos;s fresh cuts</span>
          <h2 className="font-display text-[clamp(1.875rem,4vw,2.875rem)] font-extrabold leading-[1.08] tracking-tight text-k2-green-deep">
            Cut at dawn.
            <br />
            On your stove by dinner.
          </h2>
        </div>
        <p className="max-w-md text-base text-[#4d5a52]">
          Pick your weight, add to cart, done. Every pack is hand-cut to order
          from this morning&apos;s batch.
        </p>
      </div>
    </div>
  );
}
