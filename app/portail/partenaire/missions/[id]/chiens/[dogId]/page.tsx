"use client";

import { use } from "react";
import FicheEditor from "@/components/portal/FicheEditor";
import PortalShell from "@/components/portal/PortalShell";

export default function PartnerDogFiche({ params }: { params: Promise<{ id: string; dogId: string }> }) {
  const { dogId } = use(params);
  return (
    <PortalShell role="partner">
      <FicheEditor key={dogId} dogId={dogId} backHref="/portail/partenaire/missions" />
    </PortalShell>
  );
}
