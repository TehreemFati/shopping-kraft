"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlugInput } from "@/components/admin/SlugInput";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
  FieldLabel,
} from "@/components/admin/AdminFormShell";
import { useAdminFormSubmit } from "@/hooks/use-admin-form-submit";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { Category, AdminProduct } from "@/types/database";

interface ProductFormProps {
  categories: Category[];
  product?: AdminProduct;
}

function categoryOptionLabel(cat: Category, categories: Category[]) {
  const parent = cat.parent_id
    ? categories.find((c) => c.id === cat.parent_id)
    : null;
  return parent ? `${parent.name} › ${cat.name}` : cat.name;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(
    product?.price !== undefined && product?.price !== null
      ? String(product.price)
      : "",
  );
  const [salePrice, setSalePrice] = useState(
    product?.sale_price !== undefined && product?.sale_price !== null
      ? String(product.sale_price)
      : "",
  );
  const [stock, setStock] = useState(
    String(product?.inventory?.[0]?.quantity ?? 0),
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.product_images?.map((i) => i.url) ?? [],
  );

  const { errors, setErrors, isPending, onSubmit } = useAdminFormSubmit({
    action: (formData) =>
      product
        ? updateProduct(product.id, formData)
        : createProduct(formData),
    successMessage: product ? "Product updated" : "Product created",
    redirectTo: "/admin/products",
    failureFallback: "Failed to save product",
    prepareFormData: (formData) => {
      formData.set("category_id", categoryId);
      formData.set("price", price);
      formData.set("sale_price", salePrice);
      formData.set("stock", stock);
      imageUrls.forEach((url) => formData.append("image_urls", url));
    },
  });

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const aParent = a.parent_id ?? "";
        const bParent = b.parent_id ?? "";
        if (!a.parent_id && b.parent_id) return -1;
        if (a.parent_id && !b.parent_id) return 1;
        if (aParent !== bParent) return aParent.localeCompare(bParent);
        return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
      }),
    [categories],
  );

  const selectedCategoryLabel = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? categoryOptionLabel(cat, categories) : null;
  }, [categories, categoryId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!categoryId) next.category_id = "Select a category";
    if (!price.trim()) next.price = "Price is required";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    onSubmit(e);
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <AdminFormSection title="Basics" description="Name, URL slug, and category.">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <FieldLabel htmlFor="name" required>
                Product Name
              </FieldLabel>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                aria-required
              />
              <FieldError message={errors.name} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <SlugInput
                name="slug"
                defaultValue={product?.slug}
                sourceValue={name}
                required
              />
              <FieldError message={errors.slug} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <FieldLabel required>Category</FieldLabel>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ?? "")}
              >
                <SelectTrigger
                  className="w-full min-w-0"
                  aria-invalid={!!errors.category_id}
                >
                  <SelectValue placeholder="Select category">
                    {selectedCategoryLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sortedCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {categoryOptionLabel(cat, categories)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.category_id} />
            </div>
            <div className="col-span-12 space-y-2">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description ?? ""}
                rows={5}
                aria-invalid={!!errors.description}
              />
              <FieldError message={errors.description} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Pricing & stock"
          description="PKR prices and available quantity."
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <FieldLabel htmlFor="price" required>
                Price (PKR)
              </FieldLabel>
              <NumericInput
                id="price"
                name="price"
                value={price}
                onValueChange={setPrice}
                decimal
                aria-invalid={!!errors.price}
                aria-required
                placeholder="0"
              />
              <FieldError message={errors.price} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <FieldLabel htmlFor="sale_price">Sale Price</FieldLabel>
              <NumericInput
                id="sale_price"
                name="sale_price"
                value={salePrice}
                onValueChange={setSalePrice}
                decimal
                aria-invalid={!!errors.sale_price}
                placeholder="Optional"
              />
              <FieldError message={errors.sale_price} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <FieldLabel htmlFor="sku">SKU</FieldLabel>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku ?? ""}
                aria-invalid={!!errors.sku}
              />
              <FieldError message={errors.sku} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <FieldLabel htmlFor="stock">Stock</FieldLabel>
              <NumericInput
                id="stock"
                name="stock"
                value={stock}
                onValueChange={setStock}
                decimal={false}
                aria-invalid={!!errors.stock}
                placeholder="0"
              />
              <FieldError message={errors.stock} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Images"
          description="Upload photos or paste image URLs. First image is primary."
        >
          <div className="col-span-12">
            <ImageUploader
              type="product"
              productId={product?.id}
              value={imageUrls}
              onChange={setImageUrls}
            />
          </div>
        </AdminFormSection>

        <input type="hidden" name="is_active" value="true" />
        <input
          type="hidden"
          name="is_featured"
          value={product?.is_featured ? "true" : "false"}
        />

        <AdminFormActions>
          <Button
            type="submit"
            disabled={isPending}
            variant="kraft"
          >
            {isPending ? "Saving…" : "Save Product"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
