"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  updateCartQuantity,
  removeFromCart,
} from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils/format";
import type { CartItemWithProduct } from "@/types/database";
import { toast } from "sonner";

interface CartItemsProps {
  items: CartItemWithProduct[];
}

export function CartItems({ items }: CartItemsProps) {
  const [isPending, startTransition] = useTransition();

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  function handleUpdate(itemId: string, quantity: number) {
    startTransition(async () => {
      const result = await updateCartQuantity(itemId, quantity);
      if (result.error) toast.error(result.error);
    });
  }

  function handleRemove(itemId: string) {
    startTransition(async () => {
      await removeFromCart(itemId);
      toast.success("Item removed");
    });
  }

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => {
          const image = item.products.product_images?.[0];
          return (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/product/${item.products.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.products.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending}
                        onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending}
                        onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <Button className="w-full" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
