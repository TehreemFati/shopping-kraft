"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

type PendingItem = { id: string; label: string };

type DeleteResult = { error?: string; success?: boolean } | void;

type UseConfirmDeleteOptions = {
  /** Async delete by id. Return `{ error }` to show toast.error and keep dialog open. */
  onDelete: (id: string) => Promise<DeleteResult>;
  successMessage?: string;
  title?: string;
  /** Template with `{label}` replaced by the pending item label */
  descriptionTemplate?: string;
  confirmLabel?: string;
};

export function useConfirmDelete({
  onDelete,
  successMessage = "Deleted",
  title = "Delete?",
  descriptionTemplate = "Delete “{label}”? This cannot be undone from the list.",
  confirmLabel = "Delete",
}: UseConfirmDeleteOptions) {
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<PendingItem | null>(null);

  const requestDelete = useCallback((id: string, label: string) => {
    setPending({ id, label });
  }, []);

  const clearPending = useCallback(() => setPending(null), []);

  const confirmDelete = useCallback(() => {
    if (!pending) return;
    const { id } = pending;
    startTransition(async () => {
      const result = await onDelete(id);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      setPending(null);
    });
  }, [pending, onDelete, successMessage]);

  const dialogProps = {
    open: pending !== null,
    onOpenChange: (open: boolean) => {
      if (!open) clearPending();
    },
    title,
    description: pending
      ? descriptionTemplate.replace("{label}", pending.label)
      : undefined,
    confirmLabel,
    loading: isPending,
    onConfirm: confirmDelete,
  };

  return {
    isPending,
    requestDelete,
    dialogProps,
  };
}
