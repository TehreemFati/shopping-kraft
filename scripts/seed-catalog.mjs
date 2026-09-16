/**
 * Seed storefront catalog: 12 curated categories + products with images + inventory.
 * Soft-deletes active categories/products outside the curated set.
 * Idempotent by slug.
 *
 * Usage: npm run catalog:seed
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
    name: "Baby Shower",
    slug: "baby-shower",
    description: "Sweet baskets and boxes for baby showers and newborns.",
    sort_order: 1,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Kids Gift",
    slug: "kids-gift",
    description: "Fun gift sets for little ones — toys, treats, and keepsakes.",
    sort_order: 2,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Flip Box",
    slug: "flip-box",
    description: "Surprise flip and explosion boxes for unforgettable reveals.",
    sort_order: 3,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Book Box",
    slug: "book-box",
    description: "Elegant book-style gift boxes for special moments.",
    sort_order: 4,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Cash Bouquet",
    slug: "cash-bouquet",
    description: "Stylish cash bouquets for weddings, Eidi, and celebrations.",
    sort_order: 5,
    image: "banner-good-gifts.png",
  },
  {
    name: "Window Chocolate",
    slug: "window-chocolate",
    description: "Premium chocolate boxes with clear window presentation.",
    sort_order: 6,
    image: "product-wedding-basket.png",
  },
  {
    name: "Valentine",
    slug: "valentine",
    description: "Romantic gifts for Valentine’s Day and anniversaries.",
    sort_order: 7,
    image: "product-wedding-basket.png",
  },
  {
    name: "Acrylic Box",
    slug: "acrylic-box",
    description: "Clear acrylic gift boxes with lights and keepsakes.",
    sort_order: 8,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Makeup Bouquet",
    slug: "makeup-bouquet",
    description: "Beauty bouquets packed with makeup and skincare treats.",
    sort_order: 9,
    image: "banner-good-gifts.png",
  },
  {
    name: "Basket",
    slug: "basket",
    description: "Classic gift baskets for every occasion.",
    sort_order: 10,
    image: "category-gift-baskets.png",
  },
  {
    name: "Wedding Favors",
    slug: "wedding-favors",
    description: "Elegant favors for mehndi, nikkah, and wedding guests.",
    sort_order: 11,
    image: "product-wedding-basket.png",
  },
  {
    name: "Complete Package",
    slug: "complete-package",
    description: "Full celebration packages with teddy, balloons, and more.",
    sort_order: 12,
    image: "banner-good-gifts.png",
  },
];

const PRODUCTS = [
  {
    name: "Baby Shower Soft Basket",
    slug: "baby-shower-soft-basket",
    category: "baby-shower",
    description: "Pastel baby shower basket with soft toys and keepsakes.",
    price: 3499,
    sale_price: 2999,
    sku: "SK-BABYSHOWER",
    stock: 20,
    is_featured: true,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Newborn Welcome Crate",
    slug: "newborn-welcome-crate",
    category: "baby-shower",
    description: "Wooden welcome crate for newborn celebrations.",
    price: 3999,
    sale_price: null,
    sku: "SK-NEWBORN",
    stock: 15,
    is_featured: false,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Kids Party Gift Set",
    slug: "kids-party-gift-set",
    category: "kids-gift",
    description: "Colourful kids gift set with teddy and party accents.",
    price: 2799,
    sale_price: null,
    sku: "SK-KIDSGIFT",
    stock: 25,
    is_featured: true,
    image: "product-baby-boy-wooden-basket.png",
  },
  {
    name: "Surprise Flip Box",
    slug: "surprise-flip-box",
    category: "flip-box",
    description: "Multi-layer flip box for birthdays and proposals.",
    price: 4499,
    sale_price: 4199,
    sku: "SK-FLIPBOX",
    stock: 18,
    is_featured: true,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Premium Book Box",
    slug: "premium-book-box",
    category: "book-box",
    description: "Sleek book-shaped gift box with custom message card.",
    price: 3299,
    sale_price: null,
    sku: "SK-BOOKBOX",
    stock: 22,
    is_featured: false,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Classic Cash Bouquet",
    slug: "classic-cash-bouquet",
    category: "cash-bouquet",
    description: "Hand-arranged cash bouquet for weddings and Eidi.",
    price: 5999,
    sale_price: null,
    sku: "SK-CASHBQ",
    stock: 12,
    is_featured: true,
    image: "banner-good-gifts.png",
  },
  {
    name: "Window Chocolate Gift Box",
    slug: "window-chocolate-gift-box",
    category: "window-chocolate",
    description: "Assorted chocolates in a ribboned window gift box.",
    price: 2499,
    sale_price: 2199,
    sku: "SK-WINCHOC",
    stock: 30,
    is_featured: true,
    image: "product-wedding-basket.png",
  },
  {
    name: "Valentine Rose Heart Box",
    slug: "valentine-rose-heart-box",
    category: "valentine",
    description: "Heart-shaped Valentine arrangement with roses and treats.",
    price: 5499,
    sale_price: 4999,
    sku: "SK-VALENTINE",
    stock: 16,
    is_featured: true,
    image: "product-wedding-basket.png",
  },
  {
    name: "LED Acrylic Keepsake Box",
    slug: "led-acrylic-keepsake-box",
    category: "acrylic-box",
    description: "Clear acrylic box with fairy lights and photo keepsakes.",
    price: 4799,
    sale_price: null,
    sku: "SK-ACRYLIC",
    stock: 14,
    is_featured: false,
    image: "product-corporate-hamper.png",
  },
  {
    name: "Makeup Beauty Bouquet",
    slug: "makeup-beauty-bouquet",
    category: "makeup-bouquet",
    description: "Makeup bouquet wrapped in soft pastel paper.",
    price: 6999,
    sale_price: 6499,
    sku: "SK-MAKEUPBQ",
    stock: 10,
    is_featured: true,
    image: "banner-good-gifts.png",
  },
  {
    name: "Gentleman Gift Basket",
    slug: "gentleman-gift-basket",
    category: "basket",
    description: "Classic tuxedo-style gift basket for him.",
    price: 4599,
    sale_price: null,
    sku: "SK-BASKET",
    stock: 20,
    is_featured: true,
    image: "category-gift-baskets.png",
  },
  {
    name: "Fruit & Nuts Basket",
    slug: "fruit-nuts-basket",
    category: "basket",
    description: "Dried fruits and nuts in a reusable kraft basket.",
    price: 3299,
    sale_price: 2999,
    sku: "SK-FRUITNUT",
    stock: 24,
    is_featured: false,
    image: "category-gift-baskets.png",
  },
  {
    name: "Bridal Wedding Favor Set",
    slug: "bridal-wedding-favor-set",
    category: "wedding-favors",
    description: "Delicate wedding favor set for guests and bridal parties.",
    price: 1899,
    sale_price: null,
    sku: "SK-WEDFAVOR",
    stock: 40,
    is_featured: false,
    image: "product-wedding-basket.png",
  },
  {
    name: "Celebration Complete Package",
    slug: "celebration-complete-package",
    category: "complete-package",
    description: "Full package with teddy, balloons, and branded gift bag.",
    price: 8999,
    sale_price: 8499,
    sku: "SK-COMPLETE",
    stock: 8,
    is_featured: true,
    image: "banner-good-gifts.png",
  },
  {
    name: "Birthday Huge Gift Box",
    slug: "birthday-huge-gift-box",
    category: "complete-package",
    description: "Oversized birthday gift box packed with celebration treats.",
    price: 7499,
    sale_price: null,
    sku: "SK-HUGEBOX",
    stock: 10,
    is_featured: false,
    image: "banner-good-gifts.png",
  },
];

const CURATED_CAT_SLUGS = new Set(CATEGORIES.map((c) => c.slug));
const CURATED_PRODUCT_SLUGS = new Set(PRODUCTS.map((p) => p.slug));

const summary = {
  categoriesCreated: 0,
  categoriesSkipped: 0,
  categoriesSoftDeleted: 0,
  productsCreated: 0,
  productsSkipped: 0,
  productsSoftDeleted: 0,
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

async function softDeleteStaleCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("is_active", true)
    .is("deleted_at", null);
  if (error) throw error;

  for (const row of data ?? []) {
    if (CURATED_CAT_SLUGS.has(row.slug)) continue;
    await supabase
      .from("categories")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", row.id);
    summary.categoriesSoftDeleted += 1;
    console.log(`category soft-delete: ${row.name}`);
  }
}

async function softDeleteStaleProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("is_active", true)
    .is("deleted_at", null);
  if (error) throw error;

  for (const row of data ?? []) {
    if (CURATED_PRODUCT_SLUGS.has(row.slug)) continue;
    await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", row.id);
    summary.productsSoftDeleted += 1;
    console.log(`product soft-delete: ${row.name}`);
  }
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

      const asset = join(ASSETS, cat.image);
      const patch = {
        name: cat.name,
        description: cat.description,
        sort_order: cat.sort_order,
        is_active: true,
      };
      if (!existing.image_url && existsSync(asset)) {
        patch.image_url = await uploadFile(
          "category-images",
          `seed/${cat.slug}.png`,
          asset,
        );
      }
      await supabase.from("categories").update(patch).eq("id", existing.id);
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

  if (existing) {
    await supabase
      .from("inventory")
      .update({ quantity })
      .eq("id", existing.id);
    return;
  }

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
      await supabase
        .from("products")
        .update({
          category_id: categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          sale_price: product.sale_price,
          sku: product.sku,
          is_active: true,
          is_featured: product.is_featured,
        })
        .eq("id", existing.id);
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
  console.log("Seeding curated catalog (12 categories, 15 products)…\n");
  await softDeleteStaleCategories();
  await softDeleteStaleProducts();
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
