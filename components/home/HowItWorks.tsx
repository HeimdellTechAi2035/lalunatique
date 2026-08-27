import { SectionHeading } from "@/components/shared/SectionHeading";

const steps = [
  { title: "Prep", description: "Exfoliate and shave at least 12 hours before applying." },
  { title: "Apply", description: "Buff on evenly with a velvet mitt, following the colour guide." },
  { title: "Develop", description: "Let your tan develop — from 1 hour to overnight depending on the product." },
  { title: "Glow", description: "Rinse off the guide colour and moisturise daily to extend your tan." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="How It Works" title="Four steps to a flawless glow" />
      <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-dark">
              {i + 1}
            </span>
            <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
