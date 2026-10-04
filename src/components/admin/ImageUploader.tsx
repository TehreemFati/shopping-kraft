"use client";

import { useId, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageToStorage } from "@/lib/uploads/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploaderProps {
  type: "product" | "category";
  productId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  /** Notify parent so Save / Cancel can be disabled during upload. */
  onUploadingChange?: (uploading: boolean) => void;
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
  onUploadingChange,
  allowUrl = true,
  className,
}: ImageUploaderProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState("");

  const multiple = type === "product";

  function setBusy(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length || uploading) return;

    setInlineError(null);
    setBusy(true);
    setProgress(8);
    setStatusText(
      list.length === 1
        ? `Uploading ${list[0]!.name}…`
        : `Uploading ${list.length} images…`,
    );

    const newUrls = [...value];

    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        setStatusText(`Uploading ${file.name} (${i + 1}/${list.length})…`);
        setProgress(Math.round(((i + 0.2) / list.length) * 100));

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

        // Show local preview immediately while the network upload runs.
        const previewUrl = URL.createObjectURL(file);
        if (multiple) {
          newUrls.push(previewUrl);
          onChange([...newUrls]);
        } else {
          newUrls.splice(0, newUrls.length, previewUrl);
          onChange([...newUrls]);
        }

        try {
          const result = await uploadImageToStorage(type, file, { productId });
          if (result.url) {
            const idx = newUrls.lastIndexOf(previewUrl);
            if (idx >= 0) {
              URL.revokeObjectURL(previewUrl);
              newUrls[idx] = result.url;
            } else if (multiple) {
              newUrls.push(result.url);
            } else {
              newUrls.splice(0, newUrls.length, result.url);
            }
            onChange([...newUrls]);
            setProgress(Math.round(((i + 1) / list.length) * 100));
          } else {
            const msg = result.error ?? "Upload failed";
            // Keep preview so the user still sees the image; mark error.
            setInlineError(msg);
            toast.error(msg);
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Upload failed unexpectedly";
          setInlineError(msg);
          toast.error(msg);
        }

        if (!multiple) break;
      }

      setStatusText("Upload complete");
      setProgress(100);
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        setStatusText(null);
        setProgress(0);
      }, 800);
    }
  }

  function removeImage(index: number) {
    const url = value[index];
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
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
    <div className={cn("relative space-y-4", className)} aria-busy={uploading}>
      {uploading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-kraft-mist/75 backdrop-blur-[1px]">
          <div className="mx-4 w-full max-w-xs space-y-3 rounded-2xl border border-kraft-ink/10 bg-card px-4 py-4 shadow-lg ring-1 ring-kraft-ink/5">
            <div className="flex items-center gap-2 text-sm font-medium text-kraft-ink">
              <Loader2 className="size-4 shrink-0 animate-spin" />
              <span className="truncate">{statusText ?? "Uploading…"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-kraft-ink/10">
              <div
                className="h-full rounded-full bg-kraft-ink transition-[width] duration-300 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(progress, 12))}%`,
                }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {Math.min(100, progress)}% · Save / Cancel locked until done
            </p>
          </div>
        </div>
      ) : null}

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-kraft-mist/40 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.35";
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                disabled={uploading}
                className="absolute right-1.5 top-1.5 cursor-pointer rounded-full bg-kraft-ink/80 p-1 text-white opacity-90 transition hover:bg-destructive disabled:cursor-not-allowed"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (uploading) return;
            if (e.dataTransfer.files?.length) {
              void processFiles(e.dataTransfer.files);
            }
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
            dragOver
              ? "border-kraft-citrus bg-kraft-citrus/10"
              : "border-border bg-muted/30 hover:border-kraft-ink/40 hover:bg-kraft-mist/50",
            uploading && "pointer-events-none border-kraft-ink/30 bg-kraft-mist/60",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kraft-ink text-kraft-citrus">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </div>
          <p className="text-sm font-medium text-kraft-ink">
            {uploading
              ? statusText ?? "Uploading…"
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
      </div>

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
                disabled={uploading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrl();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addUrl}
              disabled={uploading}
            >
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
