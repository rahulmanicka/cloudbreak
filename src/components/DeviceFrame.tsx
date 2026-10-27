"use client";

import { useEffect, useState } from "react";

/**
 * On a laptop/desktop, show the app inside an iPhone-style frame so it reads as a phone app (great for the demo video).
 * On an actual phone (or a narrow window), render the app full-screen with no frame.
 * The frame uses `transform`, which makes position:fixed children (bottom nav, floating Breaky, sheets) stick to the
 * phone screen instead of the browser window.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, ""));
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="cb-stage">
      <div className="cb-device">
        <div className="cb-statusbar" aria-hidden="true">
          <span>{time}</span>
          <span className="cb-island" />
          <span className="cb-status-icons">
            <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
            <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="3" fill="none" stroke="currentColor" opacity=".45" /><rect x="2" y="2" width="15" height="7" rx="1.6" /><rect x="21.5" y="3.5" width="1.6" height="4" rx=".8" opacity=".45" /></svg>
          </span>
        </div>
        <div className="cb-screen">{children}</div>
      </div>
      <p className="cb-caption">Cloudbreak · works best on your phone</p>
    </div>
  );
}
