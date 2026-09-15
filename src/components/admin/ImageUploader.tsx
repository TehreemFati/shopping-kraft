"use client";

import { useId, useState } from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadProductImage } from "@/lib/actions/products";
import { uploadCategoryImage } from "@/lib/actions/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploaderProps {
  type: "product" | "category";
  productId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  allowUrl?: boolean;
  className?: string;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isValidImageUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUploader({
  type,
  productId,
  value,
  onChange,
  allowUrl = true,
  className,
}: ImageUploaderProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");

  const multiple = type === "product";

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;

    setInlineError(null);
    setUploading(true);
    const newUrls = [...value];

    for (const file of list) {
      if (!isImageFile(file)) {
        const msg = `"${file.name}" is not an image`;
        setInlineError(msg);
        toast.error(msg);
        continue;
      }
      if (file.size > MAX_BYTES) {
        const msg = `"${file.name}" exceeds 5MB`;
        setInlineError(msg);
        toast.error(msg);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      if (productId) formData.append("product_id", productId);

      const result =
        type === "product"
          ? await uploadProductImage(formData)
          : await uploadCategoryImage(formData);

      if (result.url) {
        if (multiple) newUrls.push(result.url);
        else {
          newUrls.splice(0, newUrls.length, result.url);
        }
      } else {
        const msg = result.error ?? "Upload failed";
        setInlineError(msg);
        toast.error(msg);
      }

      if (!multiple && newUrls.length) break;
    }

    onChange(newUrls);
    setUploading(false);
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addUrl() {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    if (!isValidImageUrl(trimmed)) {
      const msg = "Enter a valid http(s) image URL";
      setInlineError(msg);
      toast.error(msg);
      return;
    }
    setInlineError(null);
    if (multiple) onChange([...value, trimmed]);
    else onChange([trimmed]);
    setUrlValue("");
  }

  return (
    <div className={cn("space-y-4", className)}>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-kraft-mist/40 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1.5 top-1.5 rounded-full bg-kraft-ink/80 p-1 text-white opacity-90 transition hover:bg-destructive"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) {
            void processFiles(e.dataTransfer.files);
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
          dragOver
            ? "border-kraft-citrus bg-kraft-citrus/10"
            : "border-border bg-muted/30 hover:border-kraft-ink/40 hover:bg-kraft-mist/50",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kraft-ink text-kraft-citrus">
          {uploading ? (
            <Upload className="h-5 w-5 animate-pulse" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </div>
        <p className="text-sm font-medium text-kraft-ink">
          {uploading
            ? "Uploading…"
            : "Drop images here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WebP up to 5MB
          {multiple ? " · multiple allowed" : " · one image"}
        </p>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files?.length) void processFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
          id={inputId}
          disabled={uploading}
          data-testid="image-upload-input"
        />
      </label>

      {allowUrl ? (
        <div className="space-y-2">
          <Label htmlFor={`${inputId}-url`} className="text-muted-foreground">
            Or paste image URL
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`${inputId}-url`}
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://…"
                className="pl-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrl();
                  }
                }}
              />
            </div>
            <Button type="button" variant="outline" onClick={addUrl}>
              Add URL
            </Button>
          </div>
        </div>
      ) : null}

      {inlineError ? (
        <p className="text-sm text-destructive" role="alert">
          {inlineError}
        </p>
      ) : null}
    </div>
  );
}
