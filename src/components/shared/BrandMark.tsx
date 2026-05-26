/**
 * BrandMark — Identidad visual Atlas / SONDA
 * Logo: hexágono con monograma "At" + wordmark tipográfico
 */

export function BrandMark({
  compact = false,
  variant = "light",
  size = "md",
}: {
  compact?: boolean;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}) {
  const titleClass = variant === "dark" ? "text-[#EEF2FF]" : "text-slate-900";
  const subtitleClass = variant === "dark" ? "text-[#8DA0C4]" : "text-slate-500";

  const logoSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const fontSize = size === "sm" ? "text-[13px]" : size === "lg" ? "text-[17px]" : "text-[14px]";
  const subSize = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div className="flex items-center gap-3">
      {/* Hexágono SVG Atlas */}
      <AtlasHexLogo size={logoSize} />

      {!compact ? (
        <div>
          <p className={`${fontSize} font-bold tracking-[-0.02em] leading-tight ${titleClass}`}>
            Atlas
            <span className="ml-1.5 font-semibold" style={{ color: "#F59E0B" }}>·</span>
            <span className={`ml-1 font-semibold ${titleClass} opacity-75`}>SONDA</span>
          </p>
          <p className={`${subSize} font-medium tracking-[0.04em] uppercase mt-0.5 ${subtitleClass}`}>
            Soporte Inteligente ITSM
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Logo SVG hexagonal — Atlas
 * Hexágono con gradiente navy→blue + monograma "At"
 */
export function AtlasHexLogo({ size = 36 }: { size?: number }) {
  const id = "atlas-hex-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Atlas"
      role="img"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1B3D8C" />
          <stop offset="100%" stopColor="#0C1629" />
        </linearGradient>
        <linearGradient id={`${id}-amber`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Hexágono de fondo */}
      <path
        d="M20 2 L35.6 11 L35.6 29 L20 38 L4.4 29 L4.4 11 Z"
        fill={`url(#${id}-bg)`}
        stroke="rgba(245,158,11,0.35)"
        strokeWidth="0.8"
      />

      {/* Línea ámbar decorativa superior */}
      <path
        d="M11 13.5 L29 13.5"
        stroke={`url(#${id}-amber)`}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Monograma "At" */}
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="'Kumbh Sans', 'DM Sans', sans-serif"
        fontWeight="800"
        fontSize="14"
        fill="#EEF2FF"
        letterSpacing="-0.5"
      >
        At
      </text>

      {/* Punto ámbar acento */}
      <circle cx="26.5" cy="15.5" r="2" fill="#F59E0B" opacity="0.9" />
    </svg>
  );
}
