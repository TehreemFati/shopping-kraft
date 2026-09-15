"use client";

import { useTransition } from "react";
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
import {
  setReviewApproved,
  softDeleteReview,
  type AdminReview,
} from "@/lib/actions/reviews";
import { toast } from "sonner";

export function ReviewsTable({ reviews }: { reviews: AdminReview[] }) {
  const [isPending, startTransition] = useTransition();

  function moderate(id: string, approved: boolean) {
    startTransition(async () => {
      const result = await setReviewApproved(id, approved);
      if (result.error) toast.error(result.error);
      else toast.success(approved ? "Review approved" : "Review unapproved");
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    startTransition(async () => {
      const result = await softDeleteReview(id);
      if (result.error) toast.error(result.error);
      else toast.success("Review deleted");
    });
  }

  return (
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
                onClick={() => remove(review.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
