type InstagramIconProps = {
  size?: number
}

export function InstagramIcon({ size = 20 }: InstagramIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
        width="16"
        x="4"
        y="4"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="1" />
    </svg>
  )
}
