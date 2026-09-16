import type { UserRole } from "@/types/database";

export function isAdminOrStaff(role: UserRole | string | null | undefined): boolean {
  return role === "admin" || role === "staff";
}
