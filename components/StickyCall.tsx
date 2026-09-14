import { site } from "@/lib/site";
import { PhoneIcon } from "./icons";

export default function StickyCall() {
  return <a href={`tel:${site.phoneIntl}`} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 hover:bg-brand-dark" aria-label={`Appeler ${site.trainer} au ${site.phone}`}><PhoneIcon className="h-5 w-5" /><span className="hidden sm:inline">Appeler Frédéric</span></a>;
}
