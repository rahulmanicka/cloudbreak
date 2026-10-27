import { Breaky, type BreakyPose } from "./BreakyAvatar";

// You take care of Breaky by showing up (check in or finish a lesson), and Breaky's sky clears: cloud → break.
// The sky only ever gets brighter. A "yes, I used" day still counts as showing up, and Breaky is never sad,
// sick or hurt by a slip: a pet that suffers when you vape is a guilt trip, and guilt makes people stop logging honestly.
export const SKY_STAGES = [
  { min: 0, name: "Stormy", note: "Check in today and the storm starts to break." },
  { min: 1, name: "Cloudy", note: "The clouds are thinning. Keep showing up." },
  { min: 3, name: "Breaking through", note: "There's the sun. Breaky can feel it." },
  { min: 7, name: "Sunny", note: "Clear skies. Look how far you've come." },
  { min: 14, name: "Rainbow", note: "A full rainbow. You did this, one day at a time." },
] as const;

export function skyStage(daysShownUp: number) {
  let i = 0;
  SKY_STAGES.forEach((s, idx) => {
    if (daysShownUp >= s.min) i = idx;
  });
  const next = SKY_STAGES[i + 1];
  const progress = next ? (daysShownUp - SKY_STAGES[i].min) / (next.min - SKY_STAGES[i].min) : 1;
  return { index: i, stage: SKY_STAGES[i], next, progress };
}

const SKY_BG = [
  "linear-gradient(180deg, #6b7590 0%, #a3abbd 100%)",
  "linear-gradient(180deg, #8fa3bd 0%, #cfdbe8 100%)",
  "linear-gradient(180deg, #7cc8f8 0%, #dff2ff 100%)",
  "linear-gradient(180deg, #1cb0f6 0%, #bfe8ff 100%)",
  "linear-gradient(180deg, #1cb0f6 0%, #c9f0ff 100%)",
];

// Storm clouds: each stage removes one, and the rest lighten.
const CLOUDS = [
  { x: -6, y: 6, w: 150 },
  { x: 62, y: 2, w: 170 },
  { x: 30, y: 20, w: 120 },
  { x: 4, y: 64, w: 100 },
];

function Rain() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-50" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i} x1={`${(i * 37) % 100}%`} y1={50 + ((i * 53) % 120)} x2={`${((i * 37) % 100) - 1.5}%`} y2={66 + ((i * 53) % 120)} stroke="#dfe6f2" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function Cloud({ w, fill }: { w: number; fill: string }) {
  return (
    <svg width={w} height={w * 0.55} viewBox="0 0 100 55" aria-hidden="true">
      <path d="M22 50h58a18 18 0 0 0 2-35.9A24 24 0 0 0 36 12a16 16 0 0 0-14 38z" fill={fill} />
    </svg>
  );
}

function Rainbow() {
  const bands = ["#f2545b", "#ffb020", "#ffe066", "#10b39b", "#1cb0f6", "#8b7cf6"];
  return (
    <svg viewBox="0 0 200 100" className="absolute inset-x-0 top-6 mx-auto w-[90%] opacity-80" aria-hidden="true">
      {bands.map((c, i) => (
        <path key={c} d={`M${10 + i * 7} 100a${90 - i * 7} ${90 - i * 7} 0 0 1 ${180 - i * 14} 0`} fill="none" stroke={c} strokeWidth="7" />
      ))}
    </svg>
  );
}

export function SkyScene({
  index,
  pose,
  height = 230,
  lift = 4,
  breakySize = 150,
}: {
  index: number;
  pose: BreakyPose;
  height?: number;
  lift?: number; // px between Breaky and the bottom edge (room for a card overlapping the scene)
  breakySize?: number;
}) {
  const cloudsLeft = CLOUDS.length - index;
  const cloudFill = ["#4b5470", "#7d8aa3", "#c4d0de", "#ffffff"][Math.min(index, 3)];
  return (
    <div className="relative overflow-hidden transition-[background] duration-700" style={{ background: SKY_BG[index], height }}>
      {index === 0 && <Rain />}
      {index >= 4 && <Rainbow />}
      {index >= 2 && (
        <div
          className="absolute rounded-full"
          style={{
            width: 64,
            height: 64,
            right: index >= 3 ? 22 : 54,
            top: index >= 3 ? 16 : 34,
            background: "radial-gradient(circle, #ffe066 55%, #ffb020 100%)",
            boxShadow: "0 0 40px 14px rgb(255 214 102 / 0.55)",
          }}
          aria-hidden="true"
        />
      )}
      {CLOUDS.slice(0, cloudsLeft).map((c, i) => (
        <div key={i} className="cb-drift absolute" style={{ left: `${c.x}%`, top: c.y, animationDelay: `${i * -2.3}s` }}>
          <Cloud w={c.w} fill={cloudFill} />
        </div>
      ))}
      {/* Puffy white clouds once the storm has passed */}
      {index >= 3 && (
        <div className="cb-drift absolute left-[6%] top-10 opacity-90">
          <Cloud w={90} fill="#ffffff" />
        </div>
      )}
      <div className="cb-bob absolute inset-x-0 flex justify-center" style={{ bottom: lift }}>
        <Breaky key={pose} size={breakySize} pose={pose} className="cb-grow mix-blend-normal! drop-shadow-lg" />
      </div>
    </div>
  );
}
