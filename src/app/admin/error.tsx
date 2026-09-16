"use client";

import { useEffect } from "react";
import { ErrorPageShell } from "@/components/shared/ErrorPageShell";

export default function AdminError({
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
    <ErrorPageShell
      statusCode={500}
      title="Something went wrong"
      message="An error occurred in the admin panel. Please try again or return to the dashboard."
      primaryAction={{ label: "Try again", onClick: retry }}
      secondaryAction={{ label: "Back to dashboard", href: "/admin" }}
    />
  );
}
