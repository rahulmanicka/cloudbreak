import { LifeBuoy } from "lucide-react";
import Link from "next/link";

// Always-visible route to adult-run help. Rendered in every app screen's header.
// Icon-only to leave room for the XP pill and profile button; the label is kept for screen readers.
export function HelpPill() {
  return (
    <Link
      href="/help"
      aria-label="Get real help"
      title="Get real help"
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-coral-soft text-coral-dark"
    >
      <LifeBuoy size={20} strokeWidth={2.4} aria-hidden="true" />
    </Link>
  );
}
