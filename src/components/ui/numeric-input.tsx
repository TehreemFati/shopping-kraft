"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NumericInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "inputMode" | "onChange" | "value" | "defaultValue"
> & {
  /** Allow decimal point (prices). Default true. */
  decimal?: boolean;
  value?: string;
  defaultValue?: string | number | null;
  onValueChange?: (value: string) => void;
};

function sanitizeNumeric(raw: string, decimal: boolean): string {
  let next = raw.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, "");
  if (decimal) {
    const parts = next.split(".");
    if (parts.length > 2) {
      next = `${parts[0]}.${parts.slice(1).join("")}`;
    }
  }
  return next;
}

/**
 * Text input that only accepts digits (and optional decimal).
 * Value is always a string for forms; server schemas coerce to number.
 */
export function NumericInput({
  decimal = true,
  value: controlled,
  defaultValue,
  onValueChange,
  className,
  ...props
}: NumericInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState(() =>
    defaultValue === null || defaultValue === undefined
      ? ""
      : String(defaultValue),
  );
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = sanitizeNumeric(e.target.value, decimal);
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const allowed = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;
    if (decimal && e.key === "." && !value.includes(".")) return;
    if (/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const next = sanitizeNumeric(text, decimal);
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  }

  return (
    <Input
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      autoComplete="off"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={cn(className)}
      {...props}
    />
  );
}
