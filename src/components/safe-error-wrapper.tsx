// components/SafeErrorWrapper.tsx
"use client";
import { ReactNode } from "react";

export default function SafeErrorWrapper({
  children,
}: {
  children: ReactNode;
}) {
  // Simple passthrough component that doesn't use any contexts
  return <>{children}</>;
}
