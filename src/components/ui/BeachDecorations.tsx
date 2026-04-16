'use client'

/**
 * Decorative beach illustrations (shells, corals) absolutely positioned
 * around the project detail page. All inline SVGs — no image assets needed.
 * pointer-events-none so they never interfere with content interaction.
 */
export default function BeachDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Coral branch — top right */}
      <svg
        viewBox="0 0 100 120"
        className="absolute top-20 right-6 md:right-12 w-24 md:w-32 opacity-55 rotate-[6deg]"
        fill="none"
      >
        <g stroke="#d97757" strokeWidth="3" strokeLinecap="round">
          <path d="M50 115 L50 70" />
          <path d="M50 95 L30 75 M50 85 L72 65 M50 70 L40 45 M50 70 L65 40 M50 55 L30 35 M50 50 L70 28" />
          <circle cx="30" cy="75" r="4" fill="#e89579" />
          <circle cx="72" cy="65" r="4" fill="#e89579" />
          <circle cx="40" cy="45" r="4" fill="#e89579" />
          <circle cx="65" cy="40" r="4" fill="#e89579" />
          <circle cx="30" cy="35" r="4" fill="#e89579" />
          <circle cx="70" cy="28" r="4" fill="#e89579" />
        </g>
      </svg>

      {/* Scallop shell — bottom left */}
      <svg
        viewBox="0 0 120 110"
        className="absolute bottom-24 left-4 md:left-10 w-24 md:w-32 opacity-65 rotate-[-14deg]"
        fill="none"
      >
        <g stroke="#b38558" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M60 100 C 20 100 10 50 20 25 C 25 15 35 10 40 20 C 45 10 55 10 60 25 C 65 10 75 10 80 20 C 85 10 95 15 100 25 C 110 50 100 100 60 100 Z"
            fill="#e8c9a0"
          />
          <path d="M60 100 L40 22 M60 100 L52 18 M60 100 L60 18 M60 100 L68 18 M60 100 L80 22" />
        </g>
      </svg>

      {/* Spiral shell — mid right */}
      <svg
        viewBox="0 0 100 100"
        className="absolute top-[45%] right-2 md:right-8 w-16 md:w-20 opacity-55 rotate-[12deg]"
        fill="none"
      >
        <g stroke="#a87148" strokeWidth="2.5" strokeLinecap="round">
          <path
            d="M50 90 C 20 90 10 60 25 40 C 38 24 62 24 72 40 C 80 54 70 68 56 68 C 46 68 40 60 44 52 C 48 46 56 46 58 52"
            fill="#f0d7b3"
          />
        </g>
      </svg>

      {/* Small starfish — upper left, below nav */}
      <svg
        viewBox="0 0 100 100"
        className="absolute top-32 left-6 md:left-16 w-16 md:w-20 opacity-50 rotate-[-8deg]"
        fill="none"
      >
        <g stroke="#c97148" strokeWidth="2.5" strokeLinejoin="round">
          <path
            d="M50 10 L60 40 L90 42 L66 62 L74 92 L50 74 L26 92 L34 62 L10 42 L40 40 Z"
            fill="#e8a07a"
          />
          <circle cx="50" cy="52" r="3" fill="#b85a3a" />
          <circle cx="42" cy="48" r="1.5" fill="#b85a3a" />
          <circle cx="58" cy="48" r="1.5" fill="#b85a3a" />
          <circle cx="50" cy="60" r="1.5" fill="#b85a3a" />
        </g>
      </svg>

      {/* Secondary coral sprig — bottom right */}
      <svg
        viewBox="0 0 100 120"
        className="absolute bottom-10 right-10 md:right-20 w-20 md:w-24 opacity-50 rotate-[-6deg]"
        fill="none"
      >
        <g stroke="#c96a55" strokeWidth="2.5" strokeLinecap="round">
          <path d="M50 115 L50 50" />
          <path d="M50 95 L35 80 M50 80 L68 65 M50 65 L38 48 M50 55 L64 38" />
          <circle cx="35" cy="80" r="3" fill="#e58870" />
          <circle cx="68" cy="65" r="3" fill="#e58870" />
          <circle cx="38" cy="48" r="3" fill="#e58870" />
          <circle cx="64" cy="38" r="3" fill="#e58870" />
          <circle cx="50" cy="50" r="3.5" fill="#e58870" />
        </g>
      </svg>
    </div>
  )
}
