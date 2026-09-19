"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const VIDEO_SRC = "/videos/reel-terrain.mp4";
const POSTER_SRC = "/photos/reel-poster.jpg";

/**
 * Carte vidéo façon "reel" : boucle muette et silencieuse tant qu'on n'a pas
 * cliqué dessus, agrandissement en plein écran avec le son au clic.
 *
 * - La vidéo (≈10 Mo) n'est chargée que lorsqu'on approche de la section
 *   (IntersectionObserver, rootMargin 300px), jamais au chargement initial
 *   de la page.
 * - La boucle en fond se met en pause dès que la carte quitte l'écran, et
 *   repart quand elle revient (batterie / données mobiles).
 */
export default function ReelPlayer() {
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const cardVideoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const el = wrapperRef.current;
    const video = cardVideoRef.current;
    if (!el || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !open) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded, open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) cardVideoRef.current?.pause();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={wrapperRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agrandir la vidéo avec le son"
        className="group relative block aspect-[9/16] w-[254px] cursor-pointer overflow-hidden rounded-[28px] border-4 border-ink bg-ink shadow-[0_40px_70px_-30px_rgba(14,95,130,0.45)] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-[280px]"
      >
        {loaded ? (
          <video
            ref={cardVideoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image src={POSTER_SRC} alt="" fill sizes="280px" className="object-cover" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#16232c">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
            A
          </span>
          <span className="text-xs font-semibold text-white">apolo.dogtraining</span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-5 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer la vidéo"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <video
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            controls
            playsInline
            className="max-h-[88vh] w-auto max-w-full rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <track kind="captions" />
          </video>
        </div>
      )}
    </>
  );
}
