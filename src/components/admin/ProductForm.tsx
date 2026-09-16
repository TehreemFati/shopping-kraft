"use client";

import { useState, useTransition } from "react";
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
import {
  AdminFormShell,
  AdminFormSection,
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

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.product_images?.map((i) => i.url) ?? [],
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("category_id", categoryId);
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
    <AdminFormShell
      title={product ? "Edit product" : "Add product"}
      description="Gift details, pricing, stock, and gallery images."
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Basics" description="Name, URL slug, and category.">
          <div className="space-y-2">
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
          <SlugInput
            name="slug"
            defaultValue={product?.slug}
            sourceValue={name}
          />
          <FieldError message={errors.slug} />
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? "")}
              required
            >
              <SelectTrigger aria-invalid={!!errors.category_id}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {[...categories]
                  .sort((a, b) => {
                    const aParent = a.parent_id ?? "";
                    const bParent = b.parent_id ?? "";
                    if (!a.parent_id && b.parent_id) return -1;
                    if (a.parent_id && !b.parent_id) return 1;
                    if (aParent !== bParent) return aParent.localeCompare(bParent);
                    return (
                      a.sort_order - b.sort_order ||
                      a.name.localeCompare(b.name)
                    );
                  })
                  .map((cat) => {
                  const parent = cat.parent_id
                    ? categories.find((c) => c.id === cat.parent_id)
                    : null;
                  const label = parent
                    ? `${parent.name} › ${cat.name}`
                    : cat.name;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FieldError message={errors.category_id} />
          </div>
          <div className="space-y-2">
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
        </AdminFormSection>

        <AdminFormSection
          title="Pricing & stock"
          description="PKR prices and available quantity."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={product?.price}
                aria-invalid={!!errors.price}
                required
              />
              <FieldError message={errors.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="0.01"
                defaultValue={product?.sale_price ?? ""}
                aria-invalid={!!errors.sale_price}
              />
              <FieldError message={errors.sale_price} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku ?? ""}
                aria-invalid={!!errors.sku}
              />
              <FieldError message={errors.sku} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                defaultValue={product?.inventory?.[0]?.quantity ?? 0}
                aria-invalid={!!errors.stock}
              />
              <FieldError message={errors.stock} />
            </div>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Images"
          description="Upload photos or paste image URLs. First image is primary."
        >
          <ImageUploader
            type="product"
            productId={product?.id}
            value={imageUrls}
            onChange={setImageUrls}
          />
        </AdminFormSection>

        <input type="hidden" name="is_active" value="true" />
        <input
          type="hidden"
          name="is_featured"
          value={product?.is_featured ? "true" : "false"}
        />

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
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
        </div>
      </form>
    </AdminFormShell>
  );
}
