"use client";

import { useCallback, useTransition } from "react";
import { useOptionalLoading } from "@/components/providers/loading-provider";

/**
 * Wraps async UI actions with useTransition + the global loader overlay.
 * Use for forms / buttons that are not on useAdminFormSubmit.
 */
export function usePendingAction() {
  const loading = useOptionalLoading();
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    (work: () => Promise<void>) => {
      loading?.show();
      startTransition(async () => {
        try {
          await work();
        } finally {
          loading?.hide();
        }
      });
    },
    [loading],
  );

  return { isPending, run };
}
