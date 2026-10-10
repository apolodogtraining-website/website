"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// Clé de test Cloudflare (valide toujours) uniquement hors production.
const DEV_SITE_KEY = "1x00000000000000000000AA";
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? (process.env.NODE_ENV === "production" ? "" : DEV_SITE_KEY);

/** Widget Cloudflare Turnstile : appelle `onToken` avec le jeton, ou "" quand il expire. */
export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  });

  const mount = () => {
    if (!box.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(box.current, {
      sitekey: turnstileSiteKey,
      language: "fr",
      callback: (t: string) => cb.current(t),
      "expired-callback": () => cb.current(""),
      "error-callback": () => cb.current(""),
    });
  };

  useEffect(() => {
    mount(); // le script peut déjà être chargé (retour sur l'étape)
    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, []);

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={mount} />
      <div ref={box} />
    </>
  );
}
