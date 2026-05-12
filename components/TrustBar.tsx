import { ShieldCheck, Snowflake, Clock, Leaf } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    iconColor: "text-brand-red",
    bg: "bg-red-50",
    title: "Halal Certified",
    sub: "100% Authentic",
  },
  {
    icon: Snowflake,
    iconColor: "text-brand-green",
    bg: "bg-green-50",
    title: "Never Frozen",
    sub: "Always Fresh",
  },
  {
    icon: Clock,
    iconColor: "text-brand-red",
    bg: "bg-red-50",
    title: "90 Min Delivery",
    sub: "Farm to Kitchen",
  },
  {
    icon: Leaf,
    iconColor: "text-brand-green",
    bg: "bg-green-50",
    title: "No Chemicals",
    sub: "100% Natural",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-white border-y border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-default min-w-0"
              >
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.iconColor} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm break-words">{item.title}</h4>
                  <p className="text-xs text-gray-500 break-words">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
