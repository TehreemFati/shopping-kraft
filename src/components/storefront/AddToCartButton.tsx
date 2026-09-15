"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await addToCart(productId);
          if (result.error) toast.error(result.error);
          else toast.success("Added to cart");
        });
      }}
    >
      {isPending ? "Adding..." : disabled ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
