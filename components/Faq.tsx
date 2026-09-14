import Reveal from "./Reveal";

const questions = [
  ["Mon chien est très réactif : pouvez-vous l'accompagner ?", "Oui. L'évaluation comportementale permet de comprendre les déclencheurs, d'évaluer la situation et de proposer un accompagnement progressif, adapté à votre chien."],
  ["Combien de séances faut-il prévoir ?", "Cela dépend de votre objectif, de l'historique de votre chien et de votre disponibilité. Après la première évaluation, vous aurez une recommandation claire et réaliste."],
  ["Faut-il du matériel particulier ?", "Non, pas pour démarrer. Selon l'accompagnement, je vous guide vers le matériel le plus confortable et adapté à votre chien."],
  ["Utilisez-vous des méthodes coercitives ?", "Non. Le travail repose sur l'observation, la coopération et des apprentissages respectueux du chien, sans rapport de force."],
  ["Toute la famille peut-elle participer ?", "Oui. Pour obtenir des repères cohérents au quotidien, l'implication des personnes qui vivent avec le chien est toujours la bienvenue."],
];

type FaqProps = {
  /** Niveau de titre : `h1` sur la page dédiée /faq, `h2` en section d'accueil. */
  as?: "h1" | "h2";
  heading?: string;
};

export default function Faq({ as: Heading = "h2", heading }: FaqProps) {
  return (
    <section id="faq" className="bg-brand-tint py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <Reveal><span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Vos questions</span><Heading className="mt-3 text-3xl font-semibold leading-tight text-ink md:text-4xl">{heading ?? "Répondre aux vraies questions avant de commencer."}</Heading><p className="mt-5 text-ink-soft">Vous hésitez ? La première prise de contact sert aussi à vous orienter avec honnêteté.</p></Reveal>
        <div className="divide-y divide-brand-light border-y border-brand-light">
          {questions.map(([question, answer], i) => <Reveal key={question} delay={i * 45}><details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-ink"><span>{question}</span><span className="text-2xl font-normal text-brand transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 leading-relaxed text-ink-soft">{answer}</p></details></Reveal>)}
        </div>
      </div>
    </section>
  );
}
