import React from "react";

export const HangerIllustration: React.FC<{ className?: string }> = ({
  className = "w-16 h-16",
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M32 18C34.2091 18 36 16.2091 36 14C36 11.7909 34.2091 10 32 10C29.7909 10 28 11.7909 28 14C28 16 30 18 32 22"
      className="text-[var(--accent)]"
    />
    <path
      d="M32 22L12 36C10.8954 36.7364 11.2386 38 12.5 38H51.5C52.7614 38 53.1046 36.7364 52 36L32 22Z"
      className="text-[var(--accent)]"
    />
    <path d="M22 38L22 46" className="text-[var(--text-subtle)]" opacity="0.6" />
    <path d="M42 38L42 46" className="text-[var(--text-subtle)]" opacity="0.6" />
    <circle cx="32" cy="14" r="1.5" className="text-[var(--accent)]" fill="currentColor" />
  </svg>
);

export const CameraIllustration: React.FC<{ className?: string }> = ({
  className = "w-16 h-16",
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M14 24H22L25 18H39L42 24H50C52.2091 24 54 25.7909 54 28V46C54 48.2091 52.2091 50 50 50H14C11.7909 50 10 48.2091 10 46V28C10 25.7909 11.7909 24 14 24Z"
      className="text-[var(--accent)]"
    />
    <circle cx="32" cy="37" r="8" className="text-[var(--text-subtle)]" />
    <circle cx="45" cy="29" r="1.5" fill="currentColor" className="text-[var(--accent-glow)]" />
  </svg>
);

export const MirrorIllustration: React.FC<{ className?: string }> = ({
  className = "w-16 h-16",
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="18"
      y="10"
      width="28"
      height="44"
      rx="14"
      className="text-[var(--accent)]"
    />
    <path
      d="M26 18L38 46"
      strokeDasharray="4 4"
      className="text-[var(--text-subtle)]"
      opacity="0.5"
    />
    <path
      d="M12 56H52"
      className="text-[var(--text-subtle)]"
      opacity="0.4"
    />
  </svg>
);

export const EmptyBoxIllustration: React.FC<{ className?: string }> = ({
  className = "w-16 h-16",
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M14 24L32 14L50 24L32 34L14 24Z"
      className="text-[var(--accent)]"
    />
    <path
      d="M14 24V42L32 52V34"
      className="text-[var(--text-subtle)]"
    />
    <path
      d="M50 24V42L32 52"
      className="text-[var(--accent)]"
      opacity="0.7"
    />
  </svg>
);
