"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type FilterField =
  | {
      type: "search";
      name: string;
      label?: string;
      placeholder?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
    };

export function AdminFilters({
  fields,
  className,
}: {
  fields: FilterField[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const field of fields) {
      const value = String(formData.get(field.name) ?? "").trim();
      if (value && value !== "all") params.set(field.name, value);
    }
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function clear() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters = fields.some((field) => {
    const v = searchParams.get(field.name);
    return v && v !== "all";
  });

  return (
    <form
      action={apply}
      className={
        className ??
        "mb-6 flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      }
    >
      {fields.map((field) => {
        if (field.type === "search") {
          return (
            <div key={field.name} className="w-full flex-1 space-y-1.5 sm:min-w-[12rem]">
              {field.label ? (
                <Label htmlFor={field.name}>{field.label}</Label>
              ) : null}
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  defaultValue={searchParams.get(field.name) ?? ""}
                  placeholder={field.placeholder ?? "Search…"}
                  className="pl-8"
                />
              </div>
            </div>
          );
        }

        return (
          <div key={field.name} className="w-full space-y-1.5 sm:w-auto sm:min-w-[10rem]">
            <Label htmlFor={field.name}>{field.label}</Label>
            <select
              id={field.name}
              name={field.name}
              defaultValue={searchParams.get(field.name) ?? "all"}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          Apply
        </Button>
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={clear}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  );
}
