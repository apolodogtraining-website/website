import Image from "next/image";
import { site } from "@/lib/site";

export default function StickyCall() {
  return (
    <a
      href={`tel:${site.phoneIntl}`}
      aria-label="Appeler nous"
      className="group fixed bottom-5 right-5 z-40 flex h-[78px] w-[78px] items-center justify-center"
    >
      <span
        aria-hidden
        className="sticky-call-ring pointer-events-none absolute inset-0 rounded-full bg-brand"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink px-3.5 py-2 text-sm font-semibold text-white opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Appeler nous
      </span>
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-brand shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark">
        <Image
          src="/logo/paw-white.png"
          alt=""
          width={1152}
          height={1350}
          className="h-[42%] w-auto"
        />
      </span>
    </a>
  );
}
