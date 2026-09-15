"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils/format";

interface SlugInputProps {
  name: string;
  defaultValue?: string;
  sourceValue?: string;
}

export function SlugInput({ name, defaultValue, sourceValue }: SlugInputProps) {
  const [slug, setSlug] = useState(defaultValue ?? "");
  const [manual, setManual] = useState(!!defaultValue);

  useEffect(() => {
    if (!manual && sourceValue) {
      setSlug(slugify(sourceValue));
    }
  }, [sourceValue, manual]);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>Slug</Label>
      <Input
        id={name}
        name={name}
        value={slug}
        onChange={(e) => {
          setManual(true);
          setSlug(e.target.value);
        }}
        required
      />
    </div>
  );
}
