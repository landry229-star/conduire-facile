import type { ReactNode } from "react";

type SignType = "danger" | "interdiction" | "obligation" | "indication" | "stop" | "priority" | "ceder";

export interface SignData {
  type: SignType;
  label: string;
  desc: string;
}

export function SignShape({ type, icon }: { type: SignType; icon: ReactNode }) {
  if (type === "danger") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <polygon
          points="50,5 95,90 5,90"
          fill="white"
          stroke="#e8112d"
          strokeWidth="6"
        />
        {icon}
      </svg>
    );
  }
  if (type === "interdiction") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <circle cx="50" cy="50" r="45" fill="white" stroke="#e8112d" strokeWidth="6" />
        <line x1="22" y1="22" x2="78" y2="78" stroke="#e8112d" strokeWidth="6" strokeLinecap="round" />
        {icon}
      </svg>
    );
  }
  if (type === "obligation") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <circle cx="50" cy="50" r="45" fill="#0066cc" />
        <circle cx="50" cy="50" r="39" fill="white" />
        {icon}
      </svg>
    );
  }
  if (type === "indication") {
    return (
      <svg viewBox="0 0 120 100" className="size-full">
        <rect x="5" y="5" width="110" height="90" rx="8" fill="#0066cc" />
        <rect x="10" y="10" width="100" height="80" rx="6" fill="white" />
        {icon}
      </svg>
    );
  }
  if (type === "stop") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <polygon points="50,2 96,25 96,75 50,98 4,75 4,25" fill="#e8112d" stroke="white" strokeWidth="2" />
        <polygon points="50,8 90,28 90,72 50,92 10,72 10,28" fill="#e8112d" />
        <text x="50" y="48" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">STOP</text>
      </svg>
    );
  }
  if (type === "priority") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#18181b" strokeWidth="6" />
        <polygon points="50,20 80,80 20,80" fill="#18181b" />
      </svg>
    );
  }
  if (type === "ceder") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#e8112d" strokeWidth="6" />
        <polygon points="50,25 75,78 25,78" fill="#e8112d" />
      </svg>
    );
  }
  return null;
}

export function VirageDroiteIcon() {
  return (
    <path
      d="M35,70 Q35,35 55,35 L65,35"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function VirageGaucheIcon() {
  return (
    <path
      d="M65,70 Q65,35 45,35 L35,35"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function DosDaneIcon() {
  return (
    <path
      d="M20,60 Q35,40 50,60 Q65,80 80,60"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function PassageNiveauIcon() {
  return (
    <g>
      <line x1="30" y1="50" x2="70" y2="50" stroke="#18181b" strokeWidth="5" />
      <line x1="30" y1="60" x2="70" y2="60" stroke="#18181b" strokeWidth="5" />
      <line x1="30" y1="40" x2="70" y2="40" stroke="#18181b" strokeWidth="5" />
      <line x1="50" y1="20" x2="50" y2="80" stroke="#18181b" strokeWidth="4" />
    </g>
  );
}

export function RetrecissementIcon() {
  return (
    <path
      d="M30,35 L70,35 L55,65 L45,65 Z"
      fill="none"
      stroke="#18181b"
      strokeWidth="4"
      strokeLinejoin="round"
    />
  );
}

export function ChausseeGlissanteIcon() {
  return (
    <path
      d="M25,70 Q40,50 55,60 Q70,70 80,50"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function NoLeftTurnIcon() {
  return (
    <path
      d="M65,70 Q65,35 45,35 L35,35"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function SensInterditIcon() {
  return (
    <rect x="25" y="30" width="50" height="40" rx="4" fill="#18181b" />
  );
}

export function StationnementInterditIcon() {
  return (
    <g>
      <rect x="25" y="40" width="50" height="20" fill="#18181b" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">P</text>
    </g>
  );
}

export function TournerDroiteIcon() {
  return (
    <path
      d="M35,70 Q35,35 55,35 L65,35"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function ContournementIcon() {
  return (
    <path
      d="M30,50 L45,50 Q50,50 50,40 Q50,30 55,30"
      fill="none"
      stroke="#18181b"
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

export function SensUniqueIcon() {
  return (
    <g>
      <path d="M30,45 L65,45 L55,35 M65,45 L55,55" fill="none" stroke="#18181b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function HospitalIcon() {
  return (
    <g>
      <rect x="38" y="25" width="24" height="24" rx="2" fill="#e8112d" />
      <text x="50" y="43" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">+</text>
    </g>
  );
}

export function ParkingIcon() {
  return (
    <text x="50" y="60" textAnchor="middle" fill="#18181b" fontSize="32" fontWeight="bold" fontFamily="sans-serif">P</text>
  );
}

export function VitesseIcon(limit: string) {
  return function VitesseLimitComponent() {
    return (
      <text x="50" y="62" textAnchor="middle" fill="#18181b" fontSize="28" fontWeight="bold" fontFamily="sans-serif">{limit}</text>
    );
  };
}
