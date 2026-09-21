import Reveal from "./Reveal";
import MethodPhoto from "./MethodPhoto";
import MethodSteps from "./MethodSteps";

const steps = [
  ["01", "Observer", "Lors de l'évaluation, nous prenons le temps de comprendre votre chien, son environnement et votre quotidien."],
  ["02", "Construire", "Vous repartez avec un plan clair, réaliste et adapté à vos priorités — sans recette toute faite."],
  ["03", "Accompagner", "Nous avançons pas à pas avec des repères concrets, jusqu'à l'atteinte de vos objectifs."],
] as const;

export default function Method() {
  return (
    <section id="methode" className="bg-ink py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <Reveal className="relative min-h-80 overflow-hidden rounded-[2rem]">
          <MethodPhoto />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <p className="pointer-events-none absolute bottom-6 left-6 max-w-xs text-lg font-medium">Une approche sur mesure, dans le respect du rythme de votre chien.</p>
        </Reveal>
        <Reveal delay={100}>
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">La méthode Apolo</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight md:text-4xl">Comprendre avant d&apos;agir. Avancer ensemble.</h2>
          <MethodSteps steps={steps} />
        </Reveal>
      </div>
    </section>
  );
}
