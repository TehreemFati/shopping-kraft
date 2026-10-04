"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type LoadingContextValue = {
  isLoading: boolean;
  show: () => void;
  hide: () => void;
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

/**
 * Keeps a stable API for action hooks. UI feedback is button `loading` only —
 * no full-screen “Working…” overlay.
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const show = useCallback(() => {}, []);
  const hide = useCallback(() => {}, []);
  const withLoading = useCallback(async <T,>(work: () => Promise<T>) => work(), []);

  const value = useMemo(
    () => ({
      isLoading: false,
      show,
      hide,
      withLoading,
    }),
    [show, hide, withLoading],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}
