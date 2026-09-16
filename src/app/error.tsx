"use client";

import { useEffect } from "react";
import { ErrorPageShell } from "@/components/shared/ErrorPageShell";
import { ErrorSiteChrome } from "@/components/shared/ErrorSiteChrome";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorSiteChrome>
      <ErrorPageShell
        statusCode={500}
        title="Something went wrong"
        message="We could not load this page. Please try again or return home."
        primaryAction={{ label: "Try again", onClick: retry }}
        secondaryAction={{ label: "Go home", href: "/" }}
      />
    </ErrorSiteChrome>
  );
}
