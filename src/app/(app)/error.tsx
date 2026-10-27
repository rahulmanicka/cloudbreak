"use client";

import { useEffect } from "react";
import { Breaky } from "@/components/BreakyAvatar";

// After a new deploy, a tab opened on the previous version can request JavaScript chunks that no longer
// exist ("ChunkLoadError"). Reload once to pick up the new version instead of showing a crash screen.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const stale = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Failed to find Server Action/i.test(
    `${error.name} ${error.message}`,
  );

  useEffect(() => {
    if (!stale) return;
    try {
      if (sessionStorage.getItem("cb_reloaded")) return;
      sessionStorage.setItem("cb_reloaded", "1");
    } catch {}
    window.location.reload();
  }, [stale]);

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Breaky size={126} pose="calm" />
      <h1 className="mt-3 text-2xl font-black">Something went sideways</h1>
      <p className="mt-1 text-ink-soft">{stale ? "Loading the newest version…" : "Try again. If it keeps happening, refresh the page."}</p>
      {!stale && (
        <button onClick={reset} className="btn-3d mt-4 rounded-2xl bg-sky px-5 py-2 font-black text-ink">
          Try again
        </button>
      )}
    </div>
  );
}
