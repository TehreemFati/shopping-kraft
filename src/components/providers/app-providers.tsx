"use client";

import type { ReactNode } from "react";
import { LoadingProvider } from "@/components/providers/loading-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <LoadingProvider>{children}</LoadingProvider>;
}
