import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PaymentMethod, PaymentStatus } from "@/types/database";

/**
 * Payment provider webhook (JazzCash / EasyPaisa / bank).
 * Expected JSON body:
 * {
 *   "provider": "jazzcash" | "easypaisa" | "bank_transfer" | "cod",
 *   "order_id"?: "uuid",
 *   "order_number"?: "SK-...",
 *   "transaction_id": "string",
 *   "status": "paid" | "failed" | "refunded" | "pending",
 *   "amount"?: number
 * }
 *
 * Optional auth: set PAYMENT_WEBHOOK_SECRET and send header x-webhook-secret.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-webhook-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: {
    provider?: PaymentMethod;
    order_id?: string;
    order_number?: string;
    transaction_id?: string;
    status?: PaymentStatus;
    amount?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.status || (!body.order_id && !body.order_number)) {
    return NextResponse.json(
      { error: "status and order_id or order_number required" },
      { status: 400 },
    );
  }

  const service = await createServiceClient();

  let orderId = body.order_id;
  if (!orderId && body.order_number) {
    const { data: order } = await service
      .from("orders")
      .select("id")
      .eq("order_number", body.order_number)
      .maybeSingle();
    orderId = order?.id;
  }

  if (!orderId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const paymentStatus = body.status;
  const orderPaymentStatus =
    paymentStatus === "paid"
      ? "paid"
      : paymentStatus === "refunded"
        ? "refunded"
        : paymentStatus === "failed"
          ? "failed"
          : "pending";

  await service
    .from("orders")
    .update({
      payment_status: orderPaymentStatus,
      ...(paymentStatus === "paid" ? { status: "confirmed" as const } : {}),
      ...(paymentStatus === "refunded" ? { status: "cancelled" as const } : {}),
    })
    .eq("id", orderId);

  const { data: existingPayment } = await service
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPayment) {
    await service
      .from("payments")
      .update({
        status: paymentStatus,
        transaction_id: body.transaction_id ?? null,
        metadata: {
          webhook: true,
          provider: body.provider ?? null,
          amount: body.amount ?? null,
          received_at: new Date().toISOString(),
        },
      })
      .eq("id", existingPayment.id);
  } else if (body.provider && body.amount != null) {
    await service.from("payments").insert({
      order_id: orderId,
      provider: body.provider,
      amount: body.amount,
      status: paymentStatus,
      transaction_id: body.transaction_id ?? null,
      metadata: { webhook: true },
    });
  }

  return NextResponse.json({ received: true, order_id: orderId });
}
