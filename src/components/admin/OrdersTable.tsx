"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminOrder } from "@/types/database";
import { formatPrice, ORDER_STATUS_LABELS } from "@/lib/utils/format";

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>
              {order.profiles?.full_name ?? "Guest"}
              {order.profiles?.phone && (
                <p className="text-xs text-muted-foreground">
                  {order.profiles.phone}
                </p>
              )}
            </TableCell>
            <TableCell>{formatPrice(order.total)}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{order.payment_status}</Badge>
            </TableCell>
            <TableCell>
              {new Date(order.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/orders/${order.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
