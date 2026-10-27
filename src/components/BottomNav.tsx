"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageCircle, Siren, Sprout, Users } from "lucide-react";

// No Help tab: "Get real help" is pinned in the header of every screen, so the slot goes to the lesson path.
const TABS = [
  { href: "/home", label: "Today", Icon: Sprout, match: ["/home"] },
  { href: "/learn", label: "Learn", Icon: BookOpen, match: ["/learn"] },
  { href: "/coach", label: "Coach", Icon: MessageCircle, match: ["/coach"] },
  { href: "/c", label: "Community", Icon: Users, match: ["/c", "/p"] },
  { href: "/sos", label: "SOS", Icon: Siren, match: ["/sos"] },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match.some((m) => path === m || path.startsWith(m + "/"));
          const sos = label === "SOS";
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-semibold ${
                  active ? "text-sky-dark" : sos ? "text-coral" : "text-muted"
                }`}
              >
                <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${active ? "bg-sky-soft" : ""}`}>
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
