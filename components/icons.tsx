import type { SVGProps } from "react";
import type { Service } from "@/lib/site";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function ObedienceIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 7h9a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H8l-4 3v-3" />
      <path d="M20 8v6" />
      <circle cx="9" cy="11" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BehaviourIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21c4.5-2.7 8-6 8-10a4 4 0 0 0-7-2.6A4 4 0 0 0 6 11c0 1.2.5 2.3 1.3 3.3" />
      <path d="M9 12.5l1.8 1.8L14 11" />
    </svg>
  );
}

export function WalkIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 20l3-9 2.5 2 2.5-3 3 4 2-2 3 8" />
      <circle cx="12" cy="5" r="1.5" />
    </svg>
  );
}

export function MantrailingIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M21 21l-4.5-4.5" />
      <path d="M11 8.5v5M8.5 11h5" />
    </svg>
  );
}

export function TrackingIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 19c2-1 3-3 3-5" />
      <ellipse cx="6" cy="8" rx="1.3" ry="1.8" />
      <ellipse cx="10" cy="6" rx="1.3" ry="1.8" />
      <ellipse cx="14" cy="8" rx="1.3" ry="1.8" />
      <ellipse cx="18" cy="12" rx="1.3" ry="1.8" />
    </svg>
  );
}

export function NoseworkIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M8 13a4 4 0 1 0 8 0c0-1.5-1-2.5-1-4a3 3 0 0 0-6 0c0 1.5-1 2.5-1 4Z" />
      <path d="M12 15v0" />
      <path d="M4 6c1-1 2-1 3 0M17 6c1-1 2-1 3 0" />
    </svg>
  );
}

export function HuntingIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 4v4M9 6l3 2 3-2" />
      <path d="M6 10c0 5 2.7 9 6 9s6-4 6-9c-2 0-3.5.8-6 3-2.5-2.2-4-3-6-3Z" />
    </svg>
  );
}

const map = {
  obedience: ObedienceIcon,
  behaviour: BehaviourIcon,
  walk: WalkIcon,
  mantrailing: MantrailingIcon,
  tracking: TrackingIcon,
  nosework: NoseworkIcon,
  hunting: HuntingIcon,
};

export function ServiceIcon({
  name,
  ...props
}: IconProps & { name: Service["icon"] }) {
  const Cmp = map[name];
  return <Cmp {...props} />;
}

export function PhoneIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
    </svg>
  );
}

export function MailIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 12.5l8.5-6" />
    </svg>
  );
}

export function InstagramIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(p: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...p}>
      <path d="M14.5 21v-7.5H17l.5-3.5h-3V7.8c0-1 .3-1.7 1.7-1.7H17.6V3.1C17.3 3 16.4 3 15.3 3c-2.3 0-3.8 1.4-3.8 4v2.9H9v3.6h2.5V21h3Z" />
    </svg>
  );
}

export function WhatsAppIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4L3 21Z" />
      <path d="M9 8.8c-.2 1.9 2.2 4.6 4.6 5.4.8.3 1.6-.2 1.9-.9l-1.8-1.1-.9.7c-.9-.4-1.9-1.3-2.3-2.2l.7-.9-1-1.8c-.5.2-1.1.5-1.2 0.8Z" />
    </svg>
  );
}

export function MapPinIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21c4-4.5 7-7.5 7-11a7 7 0 1 0-14 0c0 3.5 3 6.5 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function StarIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 20.9l1.1-6.5L2.5 9.8l6.5-.9L12 2.5Z" />
    </svg>
  );
}

export function GoogleIcon(p: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...p}>
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9Z"
      />
    </svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ArrowIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
