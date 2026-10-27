// A track is one habit. The lesson/streak engine is track-agnostic,
// so supporting a new habit means adding content, not code.

export interface Track {
  id: string;
  title: string;
  blurb: string;
  status: "active" | "coming-soon";
}

export const TRACKS: Track[] = [
  { id: "vaping", title: "Quit nicotine", blurb: "Vapes, cigarettes, pouches: cravings and getting your brain back.", status: "active" },
  {
    id: "social-media",
    title: "Social media",
    blurb: "Same science, different habit.",
    status: "coming-soon",
  },
];
