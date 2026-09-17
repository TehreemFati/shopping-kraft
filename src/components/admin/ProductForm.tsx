"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/admin/AdminFormShell";
import { createProduct, updateProduct } from "@/lib/actions/products";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
  const [errors, setErrors] = useState<FormErrors>({});

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
    const formData = new FormData(e.currentTarget);
    formData.set("category_id", categoryId);
    formData.set("price", price);
    formData.set("sale_price", salePrice);
    formData.set("stock", stock);
    imageUrls.forEach((url) => formData.append("image_urls", url));

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        if (!categoryId) flat.category_id = flat.category_id ?? "Select a category";
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save product");
      } else {
        setErrors({});
        toast.success(product ? "Product updated" : "Product created");
        router.push("/admin/products");
      }
    });
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Basics" description="Name, URL slug, and category.">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                required
              />
              <FieldError message={errors.name} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <SlugInput
                name="slug"
                defaultValue={product?.slug}
                sourceValue={name}
              />
              <FieldError message={errors.slug} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ?? "")}
                required
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
              <Label htmlFor="description">Description</Label>
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
              <Label htmlFor="price">Price (PKR)</Label>
              <NumericInput
                id="price"
                name="price"
                value={price}
                onValueChange={setPrice}
                decimal
                aria-invalid={!!errors.price}
                required
                placeholder="0"
              />
              <FieldError message={errors.price} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <Label htmlFor="sale_price">Sale Price</Label>
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
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku ?? ""}
                aria-invalid={!!errors.sku}
              />
              <FieldError message={errors.sku} />
            </div>
            <div className="col-span-12 space-y-2 sm:col-span-6">
              <Label htmlFor="stock">Stock</Label>
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
            className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
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
