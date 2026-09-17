"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import {
  setReviewApproved,
  softDeleteReview,
  type AdminReview,
} from "@/lib/actions/reviews";
import { toast } from "sonner";

export function ReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const [isModerating, startModerate] = useTransition();
  const { isPending, requestDelete, dialogProps } = useConfirmDelete({
    onDelete: softDeleteReview,
    successMessage: "Review deleted",
    title: "Delete review?",
    descriptionTemplate:
      "Delete review for “{label}”? It will no longer show on the storefront.",
  });

  function moderate(id: string, approved: boolean) {
    startModerate(async () => {
      const result = await setReviewApproved(id, approved);
      if (result.error) toast.error(result.error);
      else toast.success(approved ? "Review approved" : "Review unapproved");
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
                <StatusBadge
                  active={review.is_approved}
                  activeLabel="Approved"
                  inactiveLabel="Pending"
                />
              </TableCell>
              <TableCell className="space-x-1 text-right">
                {!review.is_approved ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isModerating || isPending}
                    onClick={() => moderate(review.id, true)}
                  >
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isModerating || isPending}
                    onClick={() => moderate(review.id, false)}
                  >
                    Unapprove
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() =>
                    requestDelete(review.id, review.products?.name ?? "product")
                  }
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
