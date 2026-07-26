"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Wordmark } from "@/components/wordmark";
import "./globals.css";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-sm flex flex-col items-center gap-3 text-center">
            <Wordmark className="text-2xl" />
            <p className="text-navy/80 text-sm">
              Something went wrong on our side. We&apos;ve been notified and are looking into it —
              try refreshing, or come back in a few minutes.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
