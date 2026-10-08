"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  ContractType,
  Frequency,
  Partner,
  PortalData,
  PortalSession,
  SessionStatus,
} from "./types";

export type PartnerInput = Pick<
  Partner,
  "company" | "contact" | "email" | "phone" | "siret" | "specialties" | "commissionRate" | "active"
>;

export type ContractInput = {
  partnerId: string;
  type: ContractType;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  address: string;
  service: string;
  price: number;
  commissionRate: number;
  frequency: Frequency | null;
  notes: string;
  /** Création uniquement : première séance et nombre de séances prévues. */
  firstDate: string;
  count: number;
  /** Inscription client à transformer en contrat (marquée « traitée » côté serveur). */
  requestId?: string;
};

export type RequestInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  dogName: string;
  dogBreed: string;
  service: string;
  type: ContractType;
  preferredDate: string;
  notes: string;
};

type Store = PortalData & {
  ready: boolean;
  session: PortalSession | null;
  currentPartner: Partner | null;
  /** Dernier message d'erreur renvoyé par le serveur (affiché par PortalShell). */
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<{ session?: PortalSession; error?: string }>;
  logout: () => Promise<void>;
  savePartner: (input: PartnerInput, id?: string) => Promise<{ id: string; password?: string } | undefined>;
  deletePartner: (id: string) => Promise<void>;
  resetPartnerPassword: (id: string) => Promise<string | undefined>;
  signContract: (signedBy: string) => Promise<void>;
  saveContract: (input: ContractInput, id?: string) => Promise<string | undefined>;
  deleteContract: (id: string) => Promise<void>;
  addSession: (contractId: string, date: string) => Promise<void>;
  setSessionStatus: (contractId: string, sessionId: string, status: SessionStatus) => Promise<void>;
  removeSession: (contractId: string, sessionId: string) => Promise<void>;
  invoiceContract: (contractId: string) => Promise<string | null>;
  markClientPaid: (invoiceId: string) => Promise<void>;
  markPayout: (invoiceId: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

export const usePortal = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePortal doit être utilisé dans <PortalProvider>");
  return v;
};

const EMPTY: PortalData = { partners: [], contracts: [], invoices: [], requests: [] };

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, payload };
}

/**
 * État du portail, tenu côté serveur (Turso). Le client ne garde qu'une copie
 * de ce que la session a le droit de voir, rechargée après chaque action.
 */
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortalData>(EMPTY);
  const [session, setSession] = useState<PortalSession | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((p: { session: PortalSession | null; data?: PortalData }) => {
        if (cancelled) return;
        setSession(p.session);
        if (p.data) setData(p.data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de joindre le serveur.");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Appelle une action serveur ; en cas d'échec, affiche l'erreur et renvoie undefined. */
  const call = useCallback(async <T,>(type: string, payload: Record<string, unknown> = {}): Promise<T | undefined> => {
    try {
      const { ok, status, payload: p } = await post("/api/portal/action", { ...payload, action: type });
      if (!ok) {
        if (status === 401) {
          setSession(null);
          setData(EMPTY);
        }
        setError(typeof p.error === "string" ? p.error : "Action impossible.");
        return undefined;
      }
      setError(null);
      setData(p.data as PortalData);
      return p.result as T;
    } catch {
      setError("Impossible de joindre le serveur.");
      return undefined;
    }
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...data,
      ready,
      session,
      currentPartner:
        session?.role === "partner" ? (data.partners.find((p) => p.id === session.partnerId) ?? null) : null,
      error,
      clearError: () => setError(null),

      login: async (email, password) => {
        try {
          const { ok, payload } = await post("/api/portal/login", { email, password });
          if (!ok) return { error: typeof payload.error === "string" ? payload.error : "Connexion impossible." };
          setSession(payload.session as PortalSession);
          setData(payload.data as PortalData);
          setError(null);
          return { session: payload.session as PortalSession };
        } catch {
          return { error: "Impossible de joindre le serveur." };
        }
      },
      logout: async () => {
        await post("/api/portal/logout", {}).catch(() => undefined);
        setSession(null);
        setData(EMPTY);
      },

      savePartner: (input, id) => call("savePartner", { ...input, id }),
      deletePartner: async (id) => void (await call("deletePartner", { id })),
      resetPartnerPassword: async (id) => (await call<{ password: string }>("resetPartnerPassword", { id }))?.password,
      signContract: async (signedBy) => void (await call("signContract", { signedBy })),

      saveContract: async (input, id) => (await call<{ id: string }>("saveContract", { ...input, id }))?.id,
      deleteContract: async (id) => void (await call("deleteContract", { id })),

      addSession: async (contractId, date) => void (await call("addSession", { contractId, date })),
      setSessionStatus: async (_contractId, sessionId, status) => void (await call("setSessionStatus", { sessionId, status })),
      removeSession: async (_contractId, sessionId) => void (await call("removeSession", { sessionId })),

      invoiceContract: async (contractId) => (await call<{ id: string }>("invoiceContract", { contractId }))?.id ?? null,
      markClientPaid: async (id) => void (await call("markClientPaid", { id })),
      markPayout: async (id) => void (await call("markPayout", { id })),

      declineRequest: async (id) => void (await call("declineRequest", { id })),
      deleteRequest: async (id) => void (await call("deleteRequest", { id })),
    }),
    [data, ready, session, error, call],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Inscription publique d'un client (sans session). Renvoie un message d'erreur, ou null si tout va bien. */
export async function submitClientRequest(input: RequestInput, signedBy: string, website: string): Promise<string | null> {
  try {
    const { ok, payload } = await post("/api/portal/inscription", { ...input, signedBy, website });
    return ok ? null : typeof payload.error === "string" ? payload.error : "Envoi impossible.";
  } catch {
    return "Impossible de joindre le serveur.";
  }
}
