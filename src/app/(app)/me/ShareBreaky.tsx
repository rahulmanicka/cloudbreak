"use client";

import { Check, Share2 } from "lucide-react";
import { useState, useTransition } from "react";
import { shareTree } from "../home/actions";

export function ShareBreaky() {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const url = `${window.location.origin}${await shareTree()}`;
          const text = "My Breaky's sky is clearing ☀️";
          try {
            if (navigator.share) {
              await navigator.share({ title: "My Breaky on Cloudbreak", text, url });
              return;
            }
          } catch {
            // user cancelled the share sheet; fall back to copying
          }
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            window.prompt("Copy your Breaky link:", url);
          }
        })
      }
      className="btn-3d mt-3 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-sky-dark"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Link copied" : "Share my Breaky"}
    </button>
  );
}
