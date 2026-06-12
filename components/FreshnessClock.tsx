"use client";

import { useEffect, useState } from "react";

function getFreshnessLabel() {
  const now = new Date();
  const cut = new Date(now);
  cut.setHours(6, 0, 0, 0);
  if (now < cut) cut.setDate(cut.getDate() - 1);
  const elapsed = now.getTime() - cut.getTime();
  const h = Math.max(0, Math.floor(elapsed / 36e5));
  const m = Math.floor((elapsed % 36e5) / 6e4);
  return `${h}h ${m}m`;
}

export default function FreshnessClock({ className = "" }: { className?: string }) {
  const [label, setLabel] = useState("—");

  useEffect(() => {
    setLabel(getFreshnessLabel());
    const id = setInterval(() => setLabel(getFreshnessLabel()), 60_000);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{label}</span>;
}
