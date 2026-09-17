"use client";

import { useState, useTransition } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  setReviewApproved,
  softDeleteReview,
  type AdminReview,
} from "@/lib/actions/reviews";
import { toast } from "sonner";

export function ReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function moderate(id: string, approved: boolean) {
    startTransition(async () => {
      const result = await setReviewApproved(id, approved);
      if (result.error) toast.error(result.error);
      else toast.success(approved ? "Review approved" : "Review unapproved");
    });
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    startTransition(async () => {
      const result = await softDeleteReview(id);
      if (result.error) toast.error(result.error);
      else toast.success("Review deleted");
      setPendingDeleteId(null);
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">
                {review.products?.name ?? "—"}
              </TableCell>
              <TableCell>{review.profiles?.full_name ?? "—"}</TableCell>
              <TableCell>{review.rating}/5</TableCell>
              <TableCell className="max-w-xs truncate">
                {review.comment ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={review.is_approved ? "default" : "secondary"}>
                  {review.is_approved ? "Approved" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 text-right">
                {!review.is_approved ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => moderate(review.id, true)}
                  >
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => moderate(review.id, false)}
                  >
                    Unapprove
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setPendingDeleteId(review.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
        title="Delete review?"
        description="This review will be removed and can no longer be shown on the storefront."
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
