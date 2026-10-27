export interface Board {
  id: string;
  name: string;
  blurb: string;
  tone: "sky" | "grass" | "coral" | "sun";
}

export const BOARDS: Board[] = [
  { id: "cravings", name: "Cravings", blurb: "Riding them out, in real time.", tone: "sky" },
  { id: "first-week", name: "First week", blurb: "The hardest days. You're not alone.", tone: "sun" },
  { id: "relapse", name: "Relapse", blurb: "Slipped? Start again here, no judgment.", tone: "coral" },
  { id: "wins", name: "Wins", blurb: "Big or small. Celebrate them.", tone: "grass" },
  { id: "talking-to-parents", name: "Talking to parents", blurb: "How to bring it up with the adults in your life.", tone: "sky" },
];

export const boardById = (id: string) => BOARDS.find((b) => b.id === id);
