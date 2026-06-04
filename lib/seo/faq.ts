import { DELIVERY_AREAS_PHRASE } from "@/lib/deliveryAreas";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Single source of truth for FAQ content.
 * Imported by both the visible FAQSection component and the FAQPage JSON-LD
 * schema on the homepage so visible text always matches structured data.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is your chicken fresh or frozen?",
    answer:
      "We sell 100% fresh, never frozen chicken. Our birds are sourced daily from local farms, processed the same morning, and delivered to you within 12 hours. We maintain a strict cold chain at 0–4°C but never freeze the meat.",
  },
  {
    question: "Is the chicken Halal certified?",
    answer:
      "Yes, all our chicken is 100% Halal certified. We follow strict halal guidelines in sourcing and processing. Every batch is hand-slaughtered by certified personnel according to Islamic principles.",
  },
  {
    question: "How fast is the delivery?",
    answer:
      `We offer delivery in ~90 minutes in ${DELIVERY_AREAS_PHRASE}. Our delivery team ensures your fresh chicken reaches you quickly and safely in temperature-controlled packaging.`,
  },
  {
    question: "What are the delivery charges and areas?",
    answer:
      `We deliver only in ${DELIVERY_AREAS_PHRASE}. Free delivery on orders above ₹350. Orders below ₹350 have a small delivery fee.`,
  },
  {
    question: "How should I store the chicken after delivery?",
    answer:
      "For best freshness, refrigerate immediately at 0–4°C and consume within 24 hours of delivery. Our vacuum packs can be frozen for up to 30 days without quality loss.",
  },
  {
    question: "Do you offer custom cutting?",
    answer:
      "Absolutely! We offer custom butchery services. Need your whole chicken cut into 16 pieces for biryani? Or breast butterflied for grilling? Just add instructions in the order notes.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit cards, debit cards, and cash on delivery for your convenience.",
  },
];
