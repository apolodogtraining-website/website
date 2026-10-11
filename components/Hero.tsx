import Image from "next/image";
import Link from "next/link";
import HeroScroll from "./HeroScroll";

const NAV = [
  { label: "Approche", href: "#methode" },
  { label: "Accompagnements", href: "#services" },
  { label: "Contact", href: "/contact" },
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="apolo-arrow">
      <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

/**
 * Hero de la page d'accueil, d'après le kit « Apolo » : fond charbon, titre ivoire, chien détouré,
 * bandes bleues derrière et devant lui, qui bougent au défilement (voir HeroScroll).
 * Le contenu est entièrement en HTML : il reste lisible sans JavaScript.
 */
export default function Hero() {
  return (
    <section id="accueil" data-hero className="apolo-hero">
      <div className="apolo-scene" data-hero-scene>
        <header className="apolo-header">
          <Link href="/" aria-label="Apolo Dog Training, accueil">
            <Image src="/hero/logo-apolo.webp" alt="Apolo Dog Training" width={1200} height={474} priority quality={90} className="apolo-logo" />
          </Link>
          <nav aria-label="Navigation principale">
            {NAV.map((n) => (
              <a key={n.label} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <span className="apolo-location">
            <svg viewBox="0 0 24 30" aria-hidden="true">
              <path fill="currentColor" d="M12 1C6 1 2 5 2 11c0 7 10 18 10 18s10-11 10-18C22 5 18 1 12 1Z" />
              <circle cx="12" cy="11" r="3.5" fill="#1f2222" />
            </svg>
            Bordeaux et alentours
          </span>
          <Link href="/contact" className="apolo-cta apolo-header-cta">
            Réserver une évaluation <Arrow />
          </Link>
        </header>

        <div className="apolo-back" aria-hidden="true" />
        <Image src="/hero/sol.webp" alt="" width={1672} height={941} priority sizes="(min-width: 701px) 100vw, 190vw" quality={85} className="apolo-ground" />
        <Image
          src="/hero/chien.webp"
          alt=""
          width={1672}
          height={941}
          priority
          sizes="(min-width: 1100px) 73vw, 145vw"
          quality={90}
          className="apolo-dog"
        />
        <div className="apolo-front" aria-hidden="true">
          <div className="apolo-front-band" />
        </div>

        <div className="apolo-copy">
          <h1>
            LE POUVOIR
            <br />
            DU FLAIR
            <span className="apolo-dot" aria-hidden="true" />
            <span className="sr-only">.</span>
          </h1>
          <p>
            Éducation canine coopérative
            <br />
            et activités de flair à Bordeaux
            <br />
            et ses alentours.
          </p>
          <Link href="/contact" className="apolo-cta">
            Réserver une évaluation <Arrow />
          </Link>
        </div>

        <div className="apolo-caption" aria-hidden="true">
          <span className="apolo-number">01</span>
          <span className="apolo-rule" />
          <span className="apolo-labels">
            ÉDUCATION COOPÉRATIVE
            <br />
            ACTIVITÉS DE FLAIR
            <br />
            BORDEAUX ET ALENTOURS
          </span>
        </div>
      </div>
      <HeroScroll />
    </section>
  );
}
