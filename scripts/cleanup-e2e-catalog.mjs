/**
 * Rename E2E-polluted catalog rows, soft-delete duplicates, upload seed images.
 *
 * Usage: npm run catalog:cleanup
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

const E2E_SUFFIX = /\s+\d{10,}-\w+$/;
const E2E_PREFIX = /^E2E\s+/i;
const EDIT_NOISE = /\s+(updated|edit)\s+\S+$/i;
const TRAILING_DIGITS = /\s+\d{6,}$/;
const TIMESTAMP_TOKEN = /\d{10,}-\w+/;

const summary = {
  renamed: 0,
  softDeleted: 0,
  imagesUploaded: 0,
  skipped: 0,
};

function baseTitle(name) {
  let t = name.replace(E2E_PREFIX, "").trim();
  t = t.replace(EDIT_NOISE, "").trim();
  t = t.replace(E2E_SUFFIX, "").trim();
  t = t.replace(TRAILING_DIGITS, "").trim();
  t = t.replace(/\s+\d{10,}-\w+/g, "").trim();
  return t || name;
}

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function isE2eRow(row) {
  const name = row.name ?? row.title ?? "";
  const slug = row.slug ?? "";
  return (
    /^E2E\s+/i.test(name) ||
    E2E_SUFFIX.test(name) ||
    TIMESTAMP_TOKEN.test(name) ||
    TIMESTAMP_TOKEN.test(slug) ||
    slug.toLowerCase().startsWith("e2e-") ||
    /-\d{10,}-/.test(slug)
  );
}

function pickAsset(kind, base) {
  const key = base.toLowerCase();
  const map = {
    category: [
      [/gift basket/, "category-gift-baskets.png"],
      [/.*/, "category-gift-baskets.png"],
    ],
    product: [
      [/baby boy|wooden basket/, "product-baby-boy-wooden-basket.png"],
      [/wedding|bridal/, "product-wedding-basket.png"],
      [/corporate|hamper/, "product-corporate-hamper.png"],
      [/.*/, "product-baby-boy-wooden-basket.png"],
    ],
    banner: [[/.*/, "banner-good-gifts.png"]],
  };
  const rules = map[kind] ?? map.product;
  for (const [re, file] of rules) {
    if (re.test(key)) {
      const path = join(ASSETS, file);
      if (existsSync(path)) return path;
    }
  }
  return null;
}

async function uniqueSlug(table, desired, excludeId) {
  let slug = desired || "item";
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n + 1}`;
    let q = supabase.from(table).select("id").eq("slug", candidate).is("deleted_at", null);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
    n += 1;
    if (n > 50) return `${slug}-${Date.now()}`;
  }
}

async function uploadFile(bucket, storagePath, filePath) {
  const body = readFileSync(filePath);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, body, {
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

function groupByBase(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!isE2eRow(row)) continue;
    const label = row.name ?? row.title;
    const base = baseTitle(label) || label;
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(row);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }
  return groups;
}

async function findCleanSibling(table, base, excludeId) {
  const { data } = await supabase
    .from(table)
    .select("id, name, slug")
    .eq("name", base)
    .is("deleted_at", null)
    .neq("id", excludeId)
    .limit(1)
    .maybeSingle();
  return data;
}

async function processCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null);
  if (error) throw error;

  const groups = groupByBase(data ?? []);
  for (const [base, rows] of groups) {
    const [keeper, ...dupes] = rows;
    for (const d of dupes) {
      await supabase
        .from("categories")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", d.id);
      summary.softDeleted += 1;
    }

    const sibling = await findCleanSibling("categories", base, keeper.id);
    if (sibling && !isE2eRow(sibling)) {
      await supabase
        .from("categories")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", keeper.id);
      summary.softDeleted += 1;
      console.log(
        `category duplicate dropped: "${keeper.name}" (kept "${sibling.name}")`,
      );
      continue;
    }

    const cleanName = base;
    const slug = await uniqueSlug("categories", toSlug(cleanName), keeper.id);
    const asset = pickAsset("category", cleanName);
    let imageUrl = keeper.image_url;
    if (asset) {
      imageUrl = await uploadFile(
        "category-images",
        `seed/${slug}.png`,
        asset,
      );
    }

    const { error: upErr } = await supabase
      .from("categories")
      .update({
        name: cleanName,
        slug,
        image_url: imageUrl,
        description:
          keeper.description?.startsWith("E2E")
            ? "Curated gift baskets and hampers from Shopping Kraft."
            : keeper.description,
      })
      .eq("id", keeper.id);
    if (upErr) throw upErr;
    summary.renamed += 1;
    console.log(`category: "${keeper.name}" → "${cleanName}" (${slug})`);
  }
}

async function ensureProductImage(productId, slug, base) {
  const { data: existing } = await supabase
    .from("product_images")
    .select("id, url, is_primary")
    .eq("product_id", productId)
    .order("sort_order");

  const primary = (existing ?? []).find((i) => i.is_primary) ?? existing?.[0];
  const needsImage =
    !primary ||
    !primary.url ||
    primary.url.includes("placeholder") ||
    !primary.url.startsWith("http");

  if (!needsImage && primary?.url) {
    summary.skipped += 1;
    return primary.url;
  }

  const asset = pickAsset("product", base);
  if (!asset) return null;

  const publicUrl = await uploadFile(
    "product-images",
    `${productId}/seed-${slug}.png`,
    asset,
  );

  if (primary) {
    await supabase
      .from("product_images")
      .update({ url: publicUrl, is_primary: true, alt_text: base })
      .eq("id", primary.id);
  } else {
    await supabase.from("product_images").insert({
      product_id: productId,
      url: publicUrl,
      alt_text: base,
      sort_order: 0,
      is_primary: true,
    });
  }
  return publicUrl;
}

async function processProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null);
  if (error) throw error;

  const groups = groupByBase(data ?? []);
  for (const [base, rows] of groups) {
    const [keeper, ...dupes] = rows;
    for (const d of dupes) {
      await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", d.id);
      summary.softDeleted += 1;
    }

    const sibling = await findCleanSibling("products", base, keeper.id);
    if (sibling && !isE2eRow(sibling)) {
      await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", keeper.id);
      summary.softDeleted += 1;
      console.log(
        `product duplicate dropped: "${keeper.name}" (kept "${sibling.name}")`,
      );
      continue;
    }

    const cleanName = base;
    const slug = await uniqueSlug("products", toSlug(cleanName), keeper.id);
    const sku =
      keeper.sku && /^E2E/i.test(keeper.sku)
        ? `SK-${toSlug(cleanName).replace(/-/g, "").slice(0, 12).toUpperCase()}`
        : keeper.sku;

    const { error: upErr } = await supabase
      .from("products")
      .update({
        name: cleanName,
        slug,
        sku,
        description:
          keeper.description?.includes("E2E") || !keeper.description
            ? "Customisable wooden gift basket. Delivery across Pakistan."
            : keeper.description,
      })
      .eq("id", keeper.id);
    if (upErr) throw upErr;

    await ensureProductImage(keeper.id, slug, cleanName);
    summary.renamed += 1;
    console.log(`product: "${keeper.name}" → "${cleanName}" (${slug})`);
  }

  // Also attach images to active products that have no image rows
  const { data: activeProducts } = await supabase
    .from("products")
    .select("id, name, slug")
    .is("deleted_at", null)
    .eq("is_active", true);

  for (const p of activeProducts ?? []) {
    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", p.id);
    if ((count ?? 0) > 0) continue;
    await ensureProductImage(p.id, p.slug, p.name);
    console.log(`product image backfill: ${p.name}`);
  }
}

async function processBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .is("deleted_at", null);
  if (error) throw error;

  const e2e = (data ?? []).filter((b) => {
    const title = b.title ?? "";
    return /^E2E\s+/i.test(title) || E2E_SUFFIX.test(title);
  });

  const groups = new Map();
  for (const row of e2e) {
    const base = baseTitle(row.title) || row.title;
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(row);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  for (const [base, rows] of groups) {
    const [keeper, ...dupes] = rows;
    for (const d of dupes) {
      await supabase
        .from("banners")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", d.id);
      summary.softDeleted += 1;
    }

    const asset = pickAsset("banner", base);
    let imageUrl = keeper.image_url;
    if (asset) {
      imageUrl = await uploadFile(
        "product-images",
        `banners/seed-${toSlug(base)}.png`,
        asset,
      );
    }

    const { error: upErr } = await supabase
      .from("banners")
      .update({ title: base, image_url: imageUrl })
      .eq("id", keeper.id);
    if (upErr) throw upErr;
    summary.renamed += 1;
    console.log(`banner: "${keeper.title}" → "${base}"`);
  }
}

async function processSales() {
  const { data, error } = await supabase
    .from("sale_campaigns")
    .select("*")
    .is("deleted_at", null);
  if (error) throw error;

  const groups = groupByBase(data ?? []);
  for (const [base, rows] of groups) {
    const [keeper, ...dupes] = rows;
    for (const d of dupes) {
      await supabase
        .from("sale_campaigns")
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false,
        })
        .eq("id", d.id);
      summary.softDeleted += 1;
    }

    const slug = await uniqueSlug("sale_campaigns", toSlug(base), keeper.id);
    const { error: upErr } = await supabase
      .from("sale_campaigns")
      .update({
        name: base,
        slug,
        description:
          keeper.description?.startsWith("E2E")
            ? "Featured sale campaign"
            : keeper.description,
      })
      .eq("id", keeper.id);
    if (upErr) throw upErr;
    summary.renamed += 1;
    console.log(`sale: "${keeper.name}" → "${base}" (${slug})`);
  }
}

async function main() {
  console.log("Cleaning E2E catalog + uploading seed images…\n");
  await processCategories();
  await processProducts();
  await processBanners();
  await processSales();
  console.log("\nDone:", summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
