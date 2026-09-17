import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminRowActionsProps = {
  editHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  /** Prefer icon-only edit (products/categories) vs outline text */
  editStyle?: "icon" | "text";
  editLabel?: string;
  children?: ReactNode;
  className?: string;
};

export function AdminRowActions({
  editHref,
  onEdit,
  onDelete,
  deleteDisabled,
  editStyle = "icon",
  editLabel = "Edit",
  children,
  className,
}: AdminRowActionsProps) {
  const editButton =
    editHref || onEdit ? (
      editStyle === "text" ? (
        <Button
          variant="outline"
          size="sm"
          asChild={Boolean(editHref)}
          onClick={editHref ? undefined : onEdit}
        >
          {editHref ? <Link href={editHref}>{editLabel}</Link> : editLabel}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          asChild={Boolean(editHref)}
          onClick={editHref ? undefined : onEdit}
          aria-label={editLabel}
        >
          {editHref ? (
            <Link href={editHref}>
              <Pencil className="h-4 w-4" />
            </Link>
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      )
    ) : null;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {editButton}
      {children}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon"
          disabled={deleteDisabled}
          onClick={onDelete}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
