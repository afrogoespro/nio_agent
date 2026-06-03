interface NeoLogoProps {
  size?: number
  className?: string
}

/** Neo wordmark icon — scalable SVG for nav, favicon, and UI. */
export function NeoLogo({ size = 36, className }: NeoLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="11" fill="url(#neo-logo-bg)" />
      <path
        d="M11 28V12h4.1l6.4 11.1V12h4.1v16h-4L15.2 16.9V28H11z"
        fill="white"
      />
      <circle cx="29" cy="11" r="3.25" fill="#E0E7FF" />
      <circle cx="29" cy="11" r="1.35" fill="white" />
      <path
        d="M26.5 11c0-3 2.2-5.5 5-6.2"
        stroke="#C7D2FE"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <defs>
        <linearGradient
          id="neo-logo-bg"
          x1="4"
          y1="4"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  )
}
