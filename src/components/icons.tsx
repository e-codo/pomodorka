interface IconProps {
  className?: string;
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8.5 5.1c0-1.2 1.3-1.9 2.3-1.3l10 6a1.5 1.5 0 0 1 0 2.6l-10 6c-1 .6-2.3-.1-2.3-1.3V5.1z" transform="translate(-1.5 0)" />
    </svg>
  );
}

export function IconPause({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="6" y="4" width="4.4" height="16" rx="1.6" />
      <rect x="13.6" y="4" width="4.4" height="16" rx="1.6" />
    </svg>
  );
}

export function IconReset({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3.5 8.5A9 9 0 1 1 3 13" />
      <path d="M3 4v4.5h4.5" />
    </svg>
  );
}

export function IconSkip({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M5 6.2c0-1.2 1.3-1.9 2.3-1.3l8.2 4.9a1.5 1.5 0 0 1 0 2.6l-8.2 4.9c-1 .6-2.3-.1-2.3-1.3V6.2z" />
      <rect x="17.4" y="5" width="3" height="14" rx="1.4" />
    </svg>
  );
}

export function IconVolume({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 5.5 6.5 9H3.8a.8.8 0 0 0-.8.8v4.4c0 .44.36.8.8.8h2.7L11 18.5V5.5z" fill="currentColor" stroke="none" />
      <path d="M15 9.2a4 4 0 0 1 0 5.6" />
      <path d="M17.8 6.6a8 8 0 0 1 0 10.8" />
    </svg>
  );
}

export function IconMute({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M11 5.5 6.5 9H3.8a.8.8 0 0 0-.8.8v4.4c0 .44.36.8.8.8h2.7L11 18.5V5.5z" fill="currentColor" stroke="none" />
      <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
    </svg>
  );
}

export function IconFlame({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.6 2.3c.2 2.6-.7 4.3-2.2 5.9-1.4 1.5-3.4 3-3.4 6.1a7 7 0 0 0 14 0c0-2.3-1-4.1-2.3-5.6-.3 1-.8 1.9-1.7 2.4.4-3.4-1.3-7.3-4.4-8.8zM12 21a3.2 3.2 0 0 1-3.2-3.2c0-1.6 1-2.6 1.9-3.5.6-.6 1.2-1.3 1.5-2.1 1.4 1.2 3 3.3 3 5.6A3.2 3.2 0 0 1 12 21z" opacity="0.9" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 6.5h16M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function IconTomato({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="18.5" r="11.5" fill="#FF5C39" />
      <circle cx="12" cy="15.5" r="4" fill="#FF9478" opacity="0.65" />
      <path
        d="M16 7.5c-2 0-3.4-1-4.6-2 .4 2.2 1.6 3.4 3 3.8-1 .5-2.3.5-3.4.2 1.2 1.6 3 2.4 5 2 2 .4 3.8-.4 5-2-1.1.3-2.4.3-3.4-.2 1.4-.4 2.6-1.6 3-3.8-1.2 1-2.6 2-4.6 2z"
        fill="#43D9A3"
      />
      <path d="M16 8.8V5.4" stroke="#2FA97C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
