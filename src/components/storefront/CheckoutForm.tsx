"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";
import type { CartItemWithProduct } from "@/types/database";

interface CheckoutFormProps {
  items: CartItemWithProduct[];
  shipping: number;
  bankAccount?: {
    bank: string;
    account_title: string;
    account_number: string;
    iban: string;
  };
}

export function CheckoutForm({ items, shipping, bankAccount }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount + shipping);

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Button asChild>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("payment_method", paymentMethod);

    startTransition(async () => {
      const result = await createOrder(formData);
      if (result.error) {
        const errors = Object.values(result.error).flat();
        toast.error(errors[0] ?? "Checkout failed");
        return;
      }
      toast.success("Order placed successfully!");
      router.push(`/account/orders?success=${result.orderNumber}`);
    });
  }

  async function applyCoupon(code: string) {
    const { validateCouponCode } = await import("@/lib/actions/coupons");
    const result = await validateCouponCode(code, subtotal);
    if (result.error) {
      toast.error(result.error);
      setDiscount(0);
    } else {
      setDiscount(result.discount ?? 0);
      toast.success(`Coupon applied: -${formatPrice(result.discount ?? 0)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line1">Address</Label>
                <Input id="line1" name="line1" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line2">Address Line 2</Label>
                <Input id="line2" name="line2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input id="province" name="province" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input id="postal_code" name="postal_code" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="payment_method_radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mr-2"
                />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment_method_radio"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                  className="mr-2"
                />
                Bank Transfer
              </label>
            </div>
            {paymentMethod === "bank_transfer" && bankAccount && (
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="font-medium">Transfer to:</p>
                <p>Bank: {bankAccount.bank}</p>
                <p>Account: {bankAccount.account_title}</p>
                <p>Number: {bankAccount.account_number}</p>
                <p>IBAN: {bankAccount.iban}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input name="coupon_code" placeholder="Enter coupon code" />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  if (input?.value) applyCoupon(input.value);
                }}
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="notes">Order Notes</Label>
          <Textarea id="notes" name="notes" placeholder="Optional notes..." />
        </div>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.products.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
