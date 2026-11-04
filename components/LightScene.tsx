import type { FragranceSlug } from "@/data/fragrances";

/**
 * A decorative, CSS-only "scene" for each fragrance: the light phenomenon it is
 * named for, drawn with gradients. Purely atmospheric (aria-hidden); the
 * meaning is carried by the surrounding text. Slow animation classes are
 * disabled under `prefers-reduced-motion` in globals.css.
 *
 * Stars are generated from a fixed formula, not Math.random(), so the server
 * and client always render the same markup.
 */

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 37 + 11) % 97,
  top: (i * 53 + 7) % 89,
  size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  opacity: 0.35 + ((i * 17) % 55) / 100,
  delay: (i % 9) * 0.7,
}));

function Aurora() {
  const curtains = [
    { left: "-6%", width: "38%", skew: "-skew-x-12", rgb: "79,227,181", delay: "0s" },
    { left: "20%", width: "30%", skew: "skew-x-6", rgb: "139,107,255", delay: "-4s" },
    { left: "38%", width: "36%", skew: "-skew-x-6", rgb: "79,227,181", delay: "-8s" },
    { left: "60%", width: "28%", skew: "skew-x-12", rgb: "167,139,250", delay: "-2s" },
    { left: "72%", width: "34%", skew: "-skew-x-6", rgb: "52,211,153", delay: "-11s" },
  ];
  return (
    <>
      {curtains.map((c) => (
        <div
          key={c.left}
          className={`scene-sway absolute -top-[10%] h-[95%] ${c.skew}`}
          style={{
            left: c.left,
            width: c.width,
            animationDelay: c.delay,
            background: `radial-gradient(ellipse 50% 50% at 50% 38%, rgba(${c.rgb},.62), rgba(${c.rgb},.16) 55%, transparent 100%)`,
          }}
        />
      ))}
      {/* A low, dark ridge so the light has a horizon to sit above. */}
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[#030304] [clip-path:polygon(0_62%,12%_38%,24%_58%,38%_22%,52%_52%,66%_30%,80%_56%,92%_36%,100%_52%,100%_100%,0_100%)]" />
    </>
  );
}

function Eclipse() {
  return (
    <>
      <div className="scene-pulse absolute left-1/2 top-1/2 aspect-square h-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,transparent_58%,rgba(255,106,43,.55)_62%,rgba(255,90,45,.18)_72%,transparent_100%)] blur-[2px]" />
      <div className="absolute left-1/2 top-1/2 aspect-square h-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#020202] shadow-[0_0_0_1.5px_rgba(255,150,80,.75),0_0_50px_6px_rgba(255,90,45,.35)]" />
    </>
  );
}

function Corona() {
  return (
    <>
      <div className="scene-spin absolute left-1/2 top-1/2 aspect-square h-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 [-webkit-mask-image:radial-gradient(circle,transparent_14%,black_30%,transparent_68%)] [background:repeating-conic-gradient(from_0deg,rgba(255,194,75,.55)_0deg_2deg,transparent_2deg_15deg)] [mask-image:radial-gradient(circle,transparent_14%,black_30%,transparent_68%)]" />
      <div className="scene-pulse absolute left-1/2 top-1/2 aspect-square h-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,226,150,.95)_0%,rgba(245,185,66,.55)_28%,rgba(242,135,46,.18)_55%,transparent_72%)]" />
    </>
  );
}

function Nocturne() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,rgba(91,111,224,.38),transparent_60%),radial-gradient(ellipse_at_80%_10%,rgba(56,45,122,.4),transparent_55%)]" />
      {STARS.map((star, index) => (
        <span
          key={index}
          className="scene-twinkle absolute rounded-full bg-[#e8ecff]"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </>
  );
}

const scenes: Record<FragranceSlug, () => React.JSX.Element> = {
  aurora: Aurora,
  eclipse: Eclipse,
  corona: Corona,
  nocturne: Nocturne,
};

export default function LightScene({
  slug,
  className = "",
}: {
  slug: FragranceSlug;
  className?: string;
}) {
  const Scene = scenes[slug];
  return (
    <div
      aria-hidden="true"
      className={`relative aspect-[4/3] overflow-hidden border border-white/10 bg-[#050507] ${className}`}
    >
      <Scene />
    </div>
  );
}
