"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { AddressFields } from "@/components/storefront/AddressFields";
import {
  StoreFormField,
  StoreSectionCard,
  storeInputClassName,
} from "@/components/storefront/store-form";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";
import type { CartItemWithProduct } from "@/types/database";

type PrepaidMethod = "jazzcash" | "easypaisa" | "bank_transfer";

interface CheckoutFormProps {
  items: CartItemWithProduct[];
  shipping: number;
  bankAccount?: {
    bank: string;
    account_title: string;
    account_number: string;
    iban: string;
  };
  jazzcashAccount?: {
    account_title: string;
    account_number: string;
  };
  easypaisaAccount?: {
    account_title: string;
    account_number: string;
  };
}

export function CheckoutForm({
  items,
  shipping,
  bankAccount,
  jazzcashAccount,
  easypaisaAccount,
}: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] =
    useState<PrepaidMethod>("jazzcash");
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount + shipping);

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty."
        actionLabel="Shop Now"
        actionHref="/shop"
        className="py-16"
      />
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
      toast.success("Order placed! Opening WhatsApp to notify us…");
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }
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
    <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <StoreSectionCard title="Shipping Details">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <StoreFormField
                label="Full Name"
                htmlFor="full_name"
                className="sm:col-span-2"
                required
              >
                <Input
                  id="full_name"
                  name="full_name"
                  aria-required
                  className={storeInputClassName}
                />
              </StoreFormField>
              <StoreFormField
                label="Phone"
                htmlFor="phone"
                className="sm:col-span-2"
                required
              >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  aria-required
                  className={storeInputClassName}
                />
              </StoreFormField>
            </div>
            <AddressFields />
          </div>
        </StoreSectionCard>

        <StoreSectionCard title="Payment Method">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Prepaid only — transfer the total, then place your order. We will
              confirm payment on WhatsApp.
            </p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="payment_method_radio"
                  checked={paymentMethod === "jazzcash"}
                  onChange={() => setPaymentMethod("jazzcash")}
                  className="mr-2"
                />
                JazzCash
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="payment_method_radio"
                  checked={paymentMethod === "easypaisa"}
                  onChange={() => setPaymentMethod("easypaisa")}
                  className="mr-2"
                />
                EasyPaisa
              </label>
              <label className="flex cursor-pointer items-center gap-2">
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

            {paymentMethod === "jazzcash" && jazzcashAccount ? (
              <div className="rounded-md bg-kraft-mist/50 p-4 text-sm">
                <p className="font-medium">Send JazzCash to:</p>
                <p>Title: {jazzcashAccount.account_title}</p>
                <p>Number: {jazzcashAccount.account_number}</p>
                <p className="mt-2 text-muted-foreground">
                  Amount: {formatPrice(total)}
                </p>
              </div>
            ) : null}

            {paymentMethod === "easypaisa" && easypaisaAccount ? (
              <div className="rounded-md bg-kraft-mist/50 p-4 text-sm">
                <p className="font-medium">Send EasyPaisa to:</p>
                <p>Title: {easypaisaAccount.account_title}</p>
                <p>Number: {easypaisaAccount.account_number}</p>
                <p className="mt-2 text-muted-foreground">
                  Amount: {formatPrice(total)}
                </p>
              </div>
            ) : null}

            {paymentMethod === "bank_transfer" && bankAccount ? (
              <div className="rounded-md bg-kraft-mist/50 p-4 text-sm">
                <p className="font-medium">Transfer to:</p>
                <p>Bank: {bankAccount.bank}</p>
                <p>Account: {bankAccount.account_title}</p>
                <p>Number: {bankAccount.account_number}</p>
                <p>IBAN: {bankAccount.iban}</p>
                <p className="mt-2 text-muted-foreground">
                  Amount: {formatPrice(total)}
                </p>
              </div>
            ) : null}
          </div>
        </StoreSectionCard>

        <StoreSectionCard title="Coupon Code">
          <div className="flex gap-2">
            <Input
              name="coupon_code"
              placeholder="Enter coupon code"
              className={storeInputClassName}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                const input = e.currentTarget
                  .previousElementSibling as HTMLInputElement;
                if (input?.value) applyCoupon(input.value);
              }}
            >
              Apply
            </Button>
          </div>
        </StoreSectionCard>

        <StoreFormField label="Order Notes" htmlFor="notes">
          <Textarea
            id="notes"
            name="notes"
            placeholder="Optional notes..."
            className={storeInputClassName}
          />
        </StoreFormField>
      </div>

      <div>
        <StoreSectionCard title="Order Summary" className="sticky top-24">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.products.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="space-y-2 border-t border-kraft-ink/10 pt-3">
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
            <Button
              type="submit"
              variant="kraft"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending
                ? "Placing Order..."
                : "Place Order & Notify on WhatsApp"}
            </Button>
          </div>
        </StoreSectionCard>
      </div>
    </form>
  );
}
