import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Cake,
  Flower2,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  Moon,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";

export const WHATSAPP_CUSTOMIZE_URL =
  "https://wa.me/923135009138?text=" +
  encodeURIComponent(
    "Hi Shopping Kraft! I'd like to customize a gift. Please help me with options.",
  );

export type HomeLink = {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  /** Optional cover image URL for homepage image sliders */
  imageUrl?: string | null;
};

export const OCCASION_LINKS: HomeLink[] = [
  {
    label: "Birthday",
    href: "/search?q=birthday",
    icon: Cake,
    description: "Celebrate another year",
  },
  {
    label: "Wedding",
    href: "/category/wedding-favors",
    icon: HeartHandshake,
    description: "Favors & couple gifts",
  },
  {
    label: "Anniversary",
    href: "/search?q=anniversary",
    icon: Heart,
    description: "Mark the milestone",
  },
  {
    label: "Valentine",
    href: "/category/valentine",
    icon: Sparkles,
    description: "Say it with a gift",
  },
  {
    label: "Baby Shower",
    href: "/category/baby-shower",
    icon: Baby,
    description: "Welcome little ones",
  },
  {
    label: "Graduation",
    href: "/search?q=graduation",
    icon: GraduationCap,
    description: "Cheer their next chapter",
  },
  {
    label: "Eid",
    href: "/search?q=eid",
    icon: Moon,
    description: "Festive sharing",
  },
  {
    label: "Just Because",
    href: "/shop",
    icon: Gift,
    description: "No reason needed",
  },
];

export const CATEGORY_LINKS: HomeLink[] = [
  { label: "Gift Boxes", href: "/category/book-box" },
  { label: "Gift Baskets", href: "/category/basket" },
  { label: "Cash Bouquets", href: "/category/cash-bouquet" },
  { label: "Acrylic Boxes", href: "/category/acrylic-box" },
  { label: "Flip Boxes", href: "/category/flip-box" },
  { label: "Chocolate Gifts", href: "/category/window-chocolate" },
  { label: "Makeup Bouquets", href: "/category/makeup-bouquet" },
  { label: "Kids Gifts", href: "/category/kids-gift" },
  { label: "Wedding Favors", href: "/category/wedding-favors" },
];

export const CUSTOM_GIFT_LINKS: HomeLink[] = [
  {
    label: "Custom Box",
    href:
      "https://wa.me/923135009138?text=" +
      encodeURIComponent("Hi! I'd like a custom gift box."),
    description: "Build a box around your story",
  },
  {
    label: "Custom Acrylic",
    href:
      "https://wa.me/923135009138?text=" +
      encodeURIComponent("Hi! I'd like a custom acrylic gift."),
    description: "Clear, modern keepsakes",
  },
  {
    label: "Custom Basket",
    href:
      "https://wa.me/923135009138?text=" +
      encodeURIComponent("Hi! I'd like a custom gift basket."),
    description: "Curated fills for any occasion",
  },
  {
    label: "Name / Photo Gifts",
    href:
      "https://wa.me/923135009138?text=" +
      encodeURIComponent("Hi! I'd like a name or photo personalized gift."),
    description: "Personal details that land",
  },
];

export const RECIPIENT_LINKS: HomeLink[] = [
  {
    label: "For Her",
    href: "/search?q=her",
    icon: Flower2,
    description: "Thoughtful picks",
  },
  {
    label: "For Him",
    href: "/search?q=him",
    icon: Gift,
    description: "Made to impress",
  },
  {
    label: "For Mom",
    href: "/search?q=mom",
    icon: Heart,
    description: "Because she deserves it",
  },
  {
    label: "For Dad",
    href: "/search?q=dad",
    icon: UserRound,
    description: "Something he’ll keep",
  },
  {
    label: "For Wife",
    href: "/search?q=wife",
    icon: Sparkles,
    description: "Romance & care",
  },
  {
    label: "For Husband",
    href: "/search?q=husband",
    icon: HeartHandshake,
    description: "A gift that lands",
  },
  {
    label: "For Kids",
    href: "/category/kids-gift",
    icon: Baby,
    description: "Playful & sweet",
  },
  {
    label: "For Friends",
    href: "/search?q=friend",
    icon: Users,
    description: "Celebrate friendship",
  },
];

export const BUDGET_LINKS: HomeLink[] = [
  { label: "Under Rs. 2,000", href: "/shop?max_price=2000" },
  { label: "Under Rs. 3,000", href: "/shop?max_price=3000" },
  { label: "Under Rs. 5,000", href: "/shop?max_price=5000" },
  {
    label: "Premium Gifts",
    href: "/shop?sort=price_desc",
    description: "Statement pieces",
  },
];
