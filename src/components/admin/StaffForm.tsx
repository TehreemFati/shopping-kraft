"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AdminFormShell,
  AdminFormSection,
  AdminFormActions,
  FieldError,
} from "@/components/admin/AdminFormShell";
import {
  ALL_PERMISSIONS,
  ADMIN_ONLY_PERMISSIONS,
  PERMISSION_LABELS,
  PERMISSION_PRESETS,
  type Permission,
} from "@/lib/auth/permissions";
import { createStaff, updateStaff } from "@/lib/actions/staff";
import {
  flattenFieldErrors,
  firstFormError,
  type FormErrors,
} from "@/lib/utils/form-errors";
import { toast } from "sonner";
import type { StaffMember } from "@/types/database";

const ASSIGNABLE = ALL_PERMISSIONS.filter(
  (p) => !ADMIN_ONLY_PERMISSIONS.includes(p),
);

interface StaffFormProps {
  staff?: StaffMember;
}

export function StaffForm({ staff }: StaffFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [permissions, setPermissions] = useState<Permission[]>(
    (staff?.staff_permissions?.permissions as Permission[]) ?? [
      "dashboard.view",
    ],
  );

  const isEdit = Boolean(staff);

  const grouped = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of ASSIGNABLE) {
      const key = p.split(".")[0];
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  }, []);

  function toggle(permission: Permission, checked: boolean) {
    setPermissions((prev) =>
      checked
        ? [...new Set([...prev, permission])]
        : prev.filter((p) => p !== permission),
    );
  }

  function applyPreset(presetId: string) {
    const preset = PERMISSION_PRESETS.find((p) => p.id === presetId);
    if (preset) setPermissions([...preset.permissions]);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.delete("permissions");
    permissions.forEach((p) => formData.append("permissions", p));

    startTransition(async () => {
      const result = isEdit
        ? await updateStaff(staff!.id, formData)
        : await createStaff(formData);

      if (result.error) {
        const flat = flattenFieldErrors(
          result.error as Record<string, string[] | undefined>,
        );
        setErrors(flat);
        toast.error(firstFormError(flat) ?? "Failed to save staff");
      } else {
        setErrors({});
        toast.success(isEdit ? "Staff updated" : "Staff created");
        router.push("/admin/staff");
        router.refresh();
      }
    });
  }

  return (
    <AdminFormShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AdminFormSection title="Profile">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={staff?.full_name ?? ""}
                required
                aria-invalid={!!errors.full_name}
              />
              <FieldError message={errors.full_name} />
            </div>

            {isEdit ? (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={staff?.email ?? ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={staff?.phone ?? ""}
                    aria-invalid={!!errors.phone}
                  />
                  <FieldError message={errors.phone} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    aria-invalid={!!errors.email}
                  />
                  <FieldError message={errors.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    required
                    aria-invalid={!!errors.password}
                  />
                  <FieldError message={errors.password} />
                </div>
              </>
            )}
          </div>
        </AdminFormSection>

        <AdminFormSection title="Permissions">
          <div className="space-y-3">
            <Label>Presets</Label>
            <div className="flex flex-wrap gap-2">
              {PERMISSION_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(grouped).map(([group, perms]) => (
              <div
                key={group}
                className="rounded-lg border border-kraft-ink/10 bg-background/60 p-3"
              >
                <p className="mb-2 text-sm font-medium capitalize text-kraft-ink">
                  {group}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {perms.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={permissions.includes(permission)}
                        onCheckedChange={(checked) =>
                          toggle(permission, checked === true)
                        }
                      />
                      {PERMISSION_LABELS[permission]}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <FieldError message={errors.permissions} />
        </AdminFormSection>

        <AdminFormActions>
          <Button
            type="submit"
            disabled={isPending || permissions.length === 0}
            className="bg-kraft-ink text-kraft-citrus hover:bg-kraft-ink/90"
          >
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create staff"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/staff">Cancel</Link>
          </Button>
        </AdminFormActions>
      </form>
    </AdminFormShell>
  );
}
