"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/admin/AdminFormShell";
import { slugify } from "@/lib/utils/format";

interface SlugInputProps {
  name: string;
  defaultValue?: string;
  sourceValue?: string;
  required?: boolean;
}

export function SlugInput({
  name,
  defaultValue,
  sourceValue,
  required,
}: SlugInputProps) {
  const [slug, setSlug] = useState(defaultValue ?? "");
  const [manual, setManual] = useState(!!defaultValue);

  useEffect(() => {
    if (!manual && sourceValue) {
      setSlug(slugify(sourceValue));
    }
  }, [sourceValue, manual]);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name} required={required}>
        Slug
      </FieldLabel>
      <Input
        id={name}
        name={name}
        value={slug}
        onChange={(e) => {
          setManual(true);
          setSlug(e.target.value);
        }}
        aria-required={required}
      />
    </div>
  );
}
