import * as React from "react";
import { cn } from "@/lib/utils/cn";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-paper", className)} {...props} />;
}

export { Card };
