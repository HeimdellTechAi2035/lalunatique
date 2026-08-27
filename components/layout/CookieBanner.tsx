"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "la-lunatique-cookie-consent";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "accepted";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

export function CookieBanner() {
  const needsConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Storage unavailable — banner will just reappear next visit.
    }
    setDismissed(true);
  }

  if (!needsConsent || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper px-4 py-4 shadow-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use essential cookies to run this site, and optional cookies to understand how it&apos;s used. See our{" "}
          <Link href="/legal/cookies" className="underline hover:text-ink">
            Cookie Policy
          </Link>
          .
        </p>
        <Button size="sm" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  );
}
