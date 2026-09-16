/**
 * Seed storefront catalog: 6 categories + 15 products with images + inventory.
 * Idempotent by slug — skips rows that already exist.
 *
 * Usage: npm run catalog:seed
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, "seed-assets");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local)",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CATEGORIES = [
  {
    name: "Gift Baskets",
    slug: "gift-baskets",
    description: "Handcrafted wooden gift baskets for every occasion.",
    sort_order: 1,
    image: "category-gift-baskets.png",
  },
  {
    name: "Wedding & Bridal",
    slug: "wedding-bridal",
    description: "Elegant hampers for weddings, mehndi, and bridal showers.",
    sort_order: 2,
    image: "product-wedding-basket.png",
  },
  {
    name: "Baby & Newborn",
    slug: "baby-newborn",
    description: "Soft, joyful baskets for baby boys, girls, and newborns.",
    sort_order: 3,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Corporate Hampers",
    slug: "corporate-hampers",
    description: "Premium client gifts and employee appreciation hampers.",
    sort_order: 4,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Occasions",
    slug: "occasions",
    description: "Birthday, anniversary, Eid, and celebration collections.",
    sort_order: 5,
    image: "banner-good-gifts.png",
  },
  {
    name: "Luxury Collections",
    slug: "luxury-collections",
    description: "Gourmet and spa-inspired luxury gift sets.",
    sort_order: 6,
    image: "product-corporate-hamper.png",
  },
];

const PRODUCTS = [
  {
    name: "Baby Boy Wooden Basket",
    slug: "baby-boy-wooden-basket",
    category: "gift-baskets",
    description:
      "Customisable wooden gift basket for baby boys. Delivery across Pakistan.",
    price: 2499,
    sale_price: null,
    sku: "SK-BABYBOY",
    stock: 25,
    is_featured: true,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Baby Girl Soft Basket",
    slug: "baby-girl-soft-basket",
    category: "baby-newborn",
    description:
      "Pastel soft-toy basket with keepsakes for a newborn baby girl.",
    price: 2699,
    sale_price: 2399,
    sku: "SK-BABYGIRL",
    stock: 20,
    is_featured: true,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Newborn Essentials Basket",
    slug: "newborn-essentials-basket",
    category: "baby-newborn",
    description: "Practical newborn essentials packed in a kraft wooden crate.",
    price: 3199,
    sale_price: null,
    sku: "SK-NEWBORN",
    stock: 18,
    is_featured: false,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Wedding Bliss Hamper",
    slug: "wedding-bliss-hamper",
    category: "wedding-bridal",
    description:
      "Elegant wedding hamper with sweets, décor accents, and keepsakes.",
    price: 5499,
    sale_price: 4999,
    sku: "SK-WEDBLISS",
    stock: 15,
    is_featured: true,
    image: "product-wedding-basket.png",
  },
  {
    name: "Bridal Treasure Basket",
    slug: "bridal-treasure-basket",
    category: "wedding-bridal",
    description: "Luxury bridal shower basket with beauty and gift essentials.",
    price: 6299,
    sale_price: null,
    sku: "SK-BRIDAL",
    stock: 12,
    is_featured: true,
    image: "product-wedding-basket.png",
  },
  {
    name: "Mehndi Celebration Box",
    slug: "mehndi-celebration-box",
    category: "wedding-bridal",
    description: "Colourful mehndi-night gift box for guests and family.",
    price: 3899,
    sale_price: null,
    sku: "SK-MEHNDI",
    stock: 22,
    is_featured: false,
    image: "product-wedding-basket.png",
  },
  {
    name: "Corporate Executive Hamper",
    slug: "corporate-executive-hamper",
    category: "corporate-hampers",
    description:
      "Premium executive hamper for clients, partners, and team rewards.",
    price: 7499,
    sale_price: 6999,
    sku: "SK-CORPEXEC",
    stock: 30,
    is_featured: true,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Thank You Client Box",
    slug: "thank-you-client-box",
    category: "corporate-hampers",
    description: "Compact appreciation box for client thank-you gifts.",
    price: 3499,
    sale_price: null,
    sku: "SK-THANKYOU",
    stock: 40,
    is_featured: false,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Team Appreciation Hamper",
    slug: "team-appreciation-hamper",
    category: "corporate-hampers",
    description: "Shared-office friendly hamper for team milestones.",
    price: 4599,
    sale_price: null,
    sku: "SK-TEAMAPP",
    stock: 28,
    is_featured: false,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Classic Gift Basket",
    slug: "classic-gift-basket",
    category: "gift-baskets",
    description: "Signature Shopping Kraft wooden gift basket for any day.",
    price: 2999,
    sale_price: null,
    sku: "SK-CLASSIC",
    stock: 35,
    is_featured: true,
    image: "category-gift-baskets.png",
  },
  {
    name: "Fruit & Nuts Basket",
    slug: "fruit-nuts-basket",
    category: "gift-baskets",
    description: "Fresh-feel dried fruits and nuts in a reusable wooden crate.",
    price: 3299,
    sale_price: 2999,
    sku: "SK-FRUITNUT",
    stock: 24,
    is_featured: false,
    image: "category-gift-baskets.png",
  },
  {
    name: "Birthday Celebration Basket",
    slug: "birthday-celebration-basket",
    category: "occasions",
    description: "Festive birthday basket with treats and party accents.",
    price: 2799,
    sale_price: null,
    sku: "SK-BDAY",
    stock: 26,
    is_featured: true,
    image: "banner-good-gifts.png",
  },
  {
    name: "Anniversary Rose Basket",
    slug: "anniversary-rose-basket",
    category: "occasions",
    description: "Romantic anniversary basket with rose-inspired packaging.",
    price: 4199,
    sale_price: 3799,
    sku: "SK-ANNIV",
    stock: 16,
    is_featured: false,
    image: "product-wedding-basket.png",
  },
  {
    name: "Eid Family Hamper",
    slug: "eid-family-hamper",
    category: "occasions",
    description: "Shareable Eid family hamper with sweets and gourmet bites.",
    price: 4999,
    sale_price: null,
    sku: "SK-EIDFAM",
    stock: 20,
    is_featured: true,
    image: "banner-good-gifts.png",
  },
  {
    name: "Luxury Gourmet Collection",
    slug: "luxury-gourmet-collection",
    category: "luxury-collections",
    description: "Curated gourmet selection for premium gifting moments.",
    price: 8999,
    sale_price: 8499,
    sku: "SK-LUXGOURMET",
    stock: 10,
    is_featured: true,
    image: "product-corporate-hamper.png",
  },
];

const summary = {
  categoriesCreated: 0,
  categoriesSkipped: 0,
  productsCreated: 0,
  productsSkipped: 0,
  imagesUploaded: 0,
};

async function uploadFile(bucket, storagePath, filePath) {
  const body = readFileSync(filePath);
  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`${bucket}/${storagePath}: ${error.message}`);
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  summary.imagesUploaded += 1;
  return publicUrl;
}

async function ensureCategories() {
  const bySlug = new Map();

  for (const cat of CATEGORIES) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id, slug, image_url")
      .eq("slug", cat.slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      bySlug.set(cat.slug, existing.id);
      summary.categoriesSkipped += 1;

      if (!existing.image_url) {
        const asset = join(ASSETS, cat.image);
        if (existsSync(asset)) {
          const imageUrl = await uploadFile(
            "category-images",
            `seed/${cat.slug}.png`,
            asset,
          );
          await supabase
            .from("categories")
            .update({ image_url: imageUrl })
            .eq("id", existing.id);
        }
      }
      continue;
    }

    const asset = join(ASSETS, cat.image);
    let imageUrl = null;
    if (existsSync(asset)) {
      imageUrl = await uploadFile(
        "category-images",
        `seed/${cat.slug}.png`,
        asset,
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image_url: imageUrl,
        is_active: true,
        sort_order: cat.sort_order,
      })
      .select("id")
      .single();

    if (error) throw error;
    bySlug.set(cat.slug, data.id);
    summary.categoriesCreated += 1;
    console.log(`category + ${cat.name}`);
  }

  return bySlug;
}

async function ensureProductImage(productId, slug, name, imageFile) {
  const { data: existing } = await supabase
    .from("product_images")
    .select("id, url")
    .eq("product_id", productId)
    .order("sort_order");

  if ((existing ?? []).length > 0) return;

  const asset = join(ASSETS, imageFile);
  if (!existsSync(asset)) {
    console.warn(`missing asset: ${imageFile}`);
    return;
  }

  const publicUrl = await uploadFile(
    "product-images",
    `${productId}/seed-${slug}.png`,
    asset,
  );

  await supabase.from("product_images").insert({
    product_id: productId,
    url: publicUrl,
    alt_text: name,
    sort_order: 0,
    is_primary: true,
  });
}

async function ensureInventory(productId, quantity) {
  const { data: existing } = await supabase
    .from("inventory")
    .select("id")
    .eq("product_id", productId)
    .is("variant_id", null)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("inventory").insert({
    product_id: productId,
    quantity,
  });
  if (error) throw error;
}

async function ensureProducts(categoryBySlug) {
  for (const product of PRODUCTS) {
    const categoryId = categoryBySlug.get(product.category);
    if (!categoryId) {
      throw new Error(`Missing category slug: ${product.category}`);
    }

    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", product.slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      summary.productsSkipped += 1;
      await ensureProductImage(
        existing.id,
        product.slug,
        product.name,
        product.image,
      );
      await ensureInventory(existing.id, product.stock);
      continue;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        category_id: categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        sale_price: product.sale_price,
        sku: product.sku,
        is_active: true,
        is_featured: product.is_featured,
      })
      .select("id")
      .single();

    if (error) throw error;

    await ensureProductImage(data.id, product.slug, product.name, product.image);
    await ensureInventory(data.id, product.stock);
    summary.productsCreated += 1;
    console.log(`product + ${product.name}`);
  }
}

async function main() {
  console.log("Seeding catalog (6 categories, 15 products)…\n");
  const categoryBySlug = await ensureCategories();
  await ensureProducts(categoryBySlug);

  const { count: catCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .is("deleted_at", null);
  const { count: prodCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .is("deleted_at", null);

  console.log("\nDone:", summary);
  console.log(`Active catalog: ${catCount} categories, ${prodCount} products`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
