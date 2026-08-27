"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-danger">Something went wrong</p>
      <h1 className="text-2xl font-semibold text-ink">We hit a snag</h1>
      <p className="text-sm text-muted">Please try again, or head back to the homepage.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
