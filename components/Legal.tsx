import Link from "next/link";

export type LegalSection = {
  heading: string;
  body: string[];
  link?: { href: string; label: string };
};

type LegalProps = {
  title: string;
  intro?: string;
  updatedAt: string;
  sections: LegalSection[];
};

/**
 * Gabarit commun aux pages légales : une colonne de lecture, une hiérarchie
 * h1 → h2, et rien d'autre. Ces pages sont lues rarement mais doivent être
 * claires et complètes.
 */
export default function Legal({ title, intro, updatedAt, sections }: LegalProps) {
  return (
    <>
      <section className="bg-brand-tint py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-5">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Informations légales
          </span>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</p>
          ) : null}
          <p className="mt-6 text-sm text-ink-soft">Dernière mise à jour : {updatedAt}</p>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 px-5">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-semibold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
              {section.link ? (
                section.link.href.startsWith("http") ? (
                  <a
                    href={section.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-brand-darker hover:text-brand"
                  >
                    {section.link.label}
                  </a>
                ) : (
                  <Link
                    href={section.link.href}
                    className="mt-3 inline-flex text-sm font-semibold text-brand-darker hover:text-brand"
                  >
                    {section.link.label}
                  </Link>
                )
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
