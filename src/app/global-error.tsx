"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: "#f4f4f5",
          color: "#18181b",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            margin: "1rem",
            padding: "2rem",
            borderRadius: "0.75rem",
            backgroundColor: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 0.5rem",
              fontSize: "3.75rem",
              fontWeight: 600,
              color: "#a1a1aa",
            }}
          >
            500
          </p>
          <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 1.5rem", color: "#71717a", lineHeight: 1.5 }}>
            A critical error occurred. Please try again or return to the
            homepage.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => retry()}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#18181b",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #e4e4e7",
                backgroundColor: "#fff",
                color: "#18181b",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
