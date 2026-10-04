"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingContextValue = {
  isLoading: boolean;
  show: () => void;
  hide: () => void;
  /** Run work while global loader is visible. Always hides when finished. */
  withLoading: <T>(work: () => Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return ctx;
}

/** Safe optional access when provider may be absent (tests / edge). */
export function useOptionalLoading() {
  return useContext(LoadingContext);
}

function NavigationProgress() {
  const pathname = usePathname();
  const { show, hide } = useLoading();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    show();
    const t = window.setTimeout(() => hide(), 400);
    return () => window.clearTimeout(t);
  }, [pathname, show, hide]);

  return null;
}

function GlobalLoaderOverlay({ active }: { active: boolean }) {
  return (
    <div
      aria-busy={active}
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200",
        active
          ? "pointer-events-auto bg-kraft-ink/20 opacity-100 backdrop-blur-[1px]"
          : "opacity-0",
      )}
    >
      {active ? (
        <div className="flex items-center gap-3 rounded-2xl border border-kraft-ink/10 bg-card/95 px-5 py-3 shadow-lg ring-1 ring-kraft-ink/5">
          <Loader2 className="size-5 animate-spin text-kraft-ink" />
          <span className="text-sm font-medium text-kraft-ink">Working…</span>
        </div>
      ) : null}
    </div>
  );
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const show = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const hide = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const withLoading = useCallback(
    async <T,>(work: () => Promise<T>) => {
      show();
      try {
        return await work();
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  const value = useMemo(
    () => ({
      isLoading: count > 0,
      show,
      hide,
      withLoading,
    }),
    [count, show, hide, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <NavigationProgress />
      <GlobalLoaderOverlay active={count > 0} />
    </LoadingContext.Provider>
  );
}
