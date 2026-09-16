import { ErrorPageShell } from "@/components/shared/ErrorPageShell";

export default function AdminNotFound() {
  return (
    <ErrorPageShell
      statusCode={404}
      title="Record not found"
      message="This admin resource does not exist or may have been removed."
      primaryAction={{ label: "Back to dashboard", href: "/admin" }}
      secondaryAction={{ label: "View storefront", href: "/" }}
    />
  );
}
