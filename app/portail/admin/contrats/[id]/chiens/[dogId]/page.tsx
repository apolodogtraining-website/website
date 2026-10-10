"use client";

import { use } from "react";
import FicheEditor from "@/components/portal/FicheEditor";
import PortalShell from "@/components/portal/PortalShell";

export default function AdminDogFiche({ params }: { params: Promise<{ id: string; dogId: string }> }) {
  const { id, dogId } = use(params);
  return (
    <PortalShell role="admin">
      <FicheEditor key={dogId} dogId={dogId} backHref={`/portail/admin/contrats/${id}`} />
    </PortalShell>
  );
}
