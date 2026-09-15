"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adjustStock } from "@/lib/actions/inventory";
import { toast } from "sonner";
import type { InventoryWithProduct } from "@/types/database";

export function InventoryTable({ items }: { items: InventoryWithProduct[] }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  function handleSave(id: string) {
    const qty = quantities[id];
    if (qty === undefined || qty < 0) return;

    startTransition(async () => {
      const result = await adjustStock(id, qty, "manual adjustment");
      if (result.error) toast.error(result.error);
      else {
        toast.success("Stock updated");
        setEditing(null);
      }
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              {item.products?.name ?? "—"}
            </TableCell>
            <TableCell>{item.products?.sku ?? "—"}</TableCell>
            <TableCell>
              {editing === item.id ? (
                <Input
                  type="number"
                  className="w-24"
                  value={quantities[item.id] ?? item.quantity}
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [item.id]: Number(e.target.value),
                    })
                  }
                />
              ) : (
                <span
                  className={
                    item.quantity <= 5 ? "font-bold text-destructive" : ""
                  }
                >
                  {item.quantity}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {editing === item.id ? (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSave(item.id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(item.id);
                    setQuantities({ ...quantities, [item.id]: item.quantity });
                  }}
                >
                  Adjust
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
