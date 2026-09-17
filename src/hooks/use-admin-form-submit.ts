"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";

type ActionResult = {
  error?: Record<string, string[] | undefined> | string;
  success?: boolean;
};

type UseAdminFormSubmitOptions = {
  /** Run the create/update action with prepared FormData */
  action: (formData: FormData) => Promise<ActionResult>;
  successMessage: string;
  /** Redirect after success (omit to stay on page) */
  redirectTo?: string;
  failureFallback?: string;
  /** Mutate FormData before submit (e.g. set image_url) */
  prepareFormData?: (formData: FormData) => void;
  onSuccess?: () => void;
};

export function useAdminFormSubmit({
  action,
  successMessage,
  redirectTo,
  failureFallback = "Failed to save",
  prepareFormData,
  onSuccess,
}: UseAdminFormSubmitOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      prepareFormData?.(formData);
      startTransition(async () => {
        const result = await action(formData);
        if (result.error) {
          const flat =
            typeof result.error === "string"
              ? { _form: result.error }
              : flattenFieldErrors(result.error);
          setErrors(flat);
          toast.error(firstFormError(flat) ?? failureFallback);
          return;
        }
        setErrors({});
        toast.success(successMessage);
        onSuccess?.();
        if (redirectTo) router.push(redirectTo);
      });
    },
    [
      action,
      prepareFormData,
      successMessage,
      redirectTo,
      failureFallback,
      onSuccess,
      router,
    ],
  );

  return { errors, setErrors, isPending, onSubmit };
}
