import Image from "next/image";

// AI-generated illustrations (gpt-image-2) are stored on white; `mix-blend-multiply` makes the white vanish
// on the app's light backgrounds, so they sit in the UI like cut-outs.
export type BreakyPose = "wave" | "calm" | "cheer" | "hug" | "proud" | "sleepy" | "think";

export function BreakyAvatar({ size = 40, pose = "wave" }: { size?: number; pose?: BreakyPose }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
      style={{ width: size, height: size }}
    >
      <Image src={`/breaky/${pose}.webp`} alt="" width={size * 2} height={size * 2} className="h-[115%] w-[115%] max-w-none object-cover mix-blend-multiply" />
    </span>
  );
}

export function Breaky({ size = 120, pose = "wave", className = "" }: { size?: number; pose?: BreakyPose; className?: string }) {
  return (
    <Image
      src={`/breaky/${pose}.webp`}
      alt=""
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
}

/** A 3D icon from the generated icon set. */
export function Icon3D({ name, size = 40, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <Image
      src={`/icons/${name}.webp`}
      alt=""
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size }}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
}
