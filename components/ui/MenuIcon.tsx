"use client";

export interface MenuIconProps {
  size?: number;
  className?: string;
}

/** Staggered-lines hamburger icon — deliberately not 3 even bars, so it
 * reads as a distinct "More" affordance rather than a generic menu glyph. */
export function MenuIcon({ size = 22, className }: MenuIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="6" y="10" width="13" height="2" rx="1" fill="currentColor" />
      <rect x="3" y="15" width="10" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
