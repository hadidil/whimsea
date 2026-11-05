import { useId } from 'react'

type ShellLogoProps = {
  size?: number
  className?: string
}

/** Coquillage Saint-Jacques : contour festonné + nervures, dégradé or. */
export function ShellLogo({ size = 24, className }: ShellLogoProps) {
  const gradientId = `shell-gold-${useId().replace(/:/g, '')}`

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="4"
          x2="28"
          y1="4"
          y2="30"
        >
          <stop offset="0" stopColor="#e4c26a" />
          <stop offset="0.5" stopColor="#c9a24b" />
          <stop offset="1" stopColor="#8a6420" />
        </linearGradient>
      </defs>
      <g
        stroke={`url(#${gradientId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      >
        <path d="M16 28 C9 24.5 4 19.5 4 14 Q4 10.2 8.6 8 Q9.6 4.8 13.4 4.6 Q16 3.6 18.6 4.6 Q22.4 4.8 23.4 8 Q28 10.2 28 14 C28 19.5 23 24.5 16 28 Z" />
        <path d="M16 28 L8.6 8" />
        <path d="M16 28 L13.4 4.8" />
        <path d="M16 28 L16 4.2" />
        <path d="M16 28 L18.6 4.8" />
        <path d="M16 28 L23.4 8" />
        <path d="M12.8 30 H19.2" />
      </g>
    </svg>
  )
}
