// What the user is quitting. Cloudbreak starts with nicotine (vapes are the main audience),
// and the lesson engine is track-based so other habits can be added later.
export const QUITTING = {
  vape: { label: "Vaping", free: "vape-free", item: "vapes" },
  cigarettes: { label: "Cigarettes", free: "smoke-free", item: "cigarettes" },
  pouches: { label: "Nicotine pouches", free: "pouch-free", item: "pouches" },
  other: { label: "Other nicotine", free: "nicotine-free", item: "nicotine" },
} as const;

export type Quitting = keyof typeof QUITTING;

export function quittingInfo(q: string | undefined) {
  return QUITTING[(q as Quitting) in QUITTING ? (q as Quitting) : "vape"];
}
