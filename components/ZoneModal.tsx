"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { serviceAreas, site } from "@/lib/site";
import { MapPinIcon } from "./icons";

type ZoneModalProps = {
  variant: "badge" | "banner";
};

export default function ZoneModal({ variant }: ZoneModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {variant === "badge" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <MapPinIcon className="h-3.5 w-3.5" />
          Zone d&apos;intervention
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-3xl bg-ink p-7 text-left text-white transition-colors hover:bg-ink/90"
        >
          <MapPinIcon className="h-6 w-6 shrink-0 text-brand" />
          <p className="flex-1">
            <span className="font-semibold">Zone d&apos;intervention :</span>{" "}
            {site.areaLong}
          </p>
          <span className="shrink-0 text-sm font-semibold text-brand underline-offset-4 hover:underline">
            Voir les communes
          </span>
        </button>
      )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-5 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-brand"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                    Zone d&apos;intervention
                  </span>
                  <h2 id={titleId} className="mt-2 text-2xl font-semibold text-ink">
                    {site.areaLong}
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-lg text-brand-darker transition-colors hover:bg-brand hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                J&apos;interviens à domicile ou en extérieur dans les communes
                suivantes :
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {serviceAreas.map((city) => (
                  <li
                    key={city}
                    className="flex items-center gap-1.5 rounded-full bg-brand-tint px-3.5 py-2 text-sm font-medium text-ink"
                  >
                    <MapPinIcon className="h-3.5 w-3.5 text-brand" />
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
