"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateOrderStatus,
  updateTrackingNumber,
  refundOrder,
} from "@/lib/actions/orders";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils/format";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import type { OrderStatus, AdminOrder } from "@/types/database";

interface OrderDetailProps {
  order: AdminOrder;
}

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderDetail({ order }: OrderDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [refundOpen, setRefundOpen] = useState(false);
  const address = order.shipping_address as Record<string, string>;

  function handleStatusChange(status: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.error) toast.error(result.error);
      else toast.success("Order status updated");
    });
  }

  function handleTrackingSave() {
    startTransition(async () => {
      const result = await updateTrackingNumber(order.id, tracking);
      if (result.error) toast.error(result.error);
      else toast.success("Tracking number saved");
    });
  }

  function confirmRefund() {
    startTransition(async () => {
      const result = await refundOrder(order.id);
      if (result.error) toast.error(result.error);
      else toast.success("Order refunded");
      setRefundOpen(false);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order {order.order_number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select
                defaultValue={order.status}
                onValueChange={(v) => handleStatusChange(v as OrderStatus)}
                disabled={isPending}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed: {new Date(order.created_at).toLocaleString()}
            </p>
            <p className="text-sm">
              Payment: {PAYMENT_METHOD_LABELS[order.payment_method]} (
              {order.payment_status})
            </p>
            <div className="space-y-2">
              <Label htmlFor="tracking">Tracking number</Label>
              <div className="flex gap-2">
                <Input
                  id="tracking"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Carrier tracking #"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleTrackingSave}
                >
                  Save
                </Button>
              </div>
            </div>
            {order.payment_status !== "refunded" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => setRefundOpen(true)}
              >
                Refund order
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{address.full_name ?? order.profiles?.full_name ?? "Guest"}</p>
            <p className="text-sm">{address.phone ?? order.profiles?.phone}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {address.line1}
              {address.line2 && `, ${address.line2}`}
              <br />
              {address.city}, {address.province} {address.postal_code}
            </p>
          </CardContent>
        </Card>

        {order.payments && order.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-2 text-sm last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {PAYMENT_METHOD_LABELS[payment.provider] ?? payment.provider}
                    </p>
                    <p className="text-muted-foreground">
                      {payment.transaction_id
                        ? `Txn: ${payment.transaction_id}`
                        : "No transaction id"}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(payment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{payment.status}</Badge>
                    <p className="mt-1 font-semibold">
                      {formatPrice(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {item.sku && (
                    <p className="text-muted-foreground">SKU: {item.sku}</p>
                  )}
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span>{formatPrice(item.total_price)}</span>
              </div>
            ))}
            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
          {order.notes && (
            <p className="mt-4 text-sm text-muted-foreground">
              Notes: {order.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Refund this order?"
        description="Stock will be restored and the order will be cancelled. This cannot be undone from here."
        confirmLabel="Refund order"
        loading={isPending}
        onConfirm={confirmRefund}
      />
    </div>
  );
}
