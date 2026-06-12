import Link from "next/link";

export default function NotFound() {
  return (
    <div className="k2-page flex items-center justify-center px-4">
      <div className="k2-card-padded w-full max-w-md text-center shadow-card">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-k2-cream-dark">
          <span className="text-4xl">🍗</span>
        </div>
        <h1 className="k2-title mb-2">404</h1>
        <h2 className="mb-2 text-xl font-semibold text-k2-green-deep">
          Page Not Found
        </h2>
        <p className="mb-6 text-[#5a6a61]">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might
          have been moved or deleted.
        </p>
        <div className="space-y-3">
          <Link href="/" className="btn-primary block w-full rounded-pill py-3 font-semibold">
            Go Home
          </Link>
          <Link href="/#products" className="btn-secondary block w-full py-3">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
