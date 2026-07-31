import {
  Lightbulb,
  WandSparkles,
  Rocket,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Imagine",
    description:
      "Start with your idea. Describe your characters, world, story, or the adventure you want to create.",
  },
  {
    number: "02",
    icon: WandSparkles,
    title: "Create",
    description:
      "Use ComicVerse tools to transform your imagination into comic panels, dialogue, characters, and artwork.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Publish",
    description:
      "Bring your story together, save your comic, and share your creation with the ComicVerse community.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#090612] px-6 py-24 text-white"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute right-[-150px] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-700/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
            Simple Process
          </p>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            FROM IDEA
            <span className="text-purple-400"> TO COMIC.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-purple-200/60 sm:text-lg">
            Creating your own comic universe is easier than ever.
            Imagine your story, create your world, and share it with others.
          </p>

        </div>

        {/* Steps */}
        <div className="grid gap-8 lg:grid-cols-3">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative"
              >

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[calc(100%+8px)] top-16 hidden w-12 lg:block">
                    <ArrowRight className="h-6 w-6 text-purple-700/60" />
                  </div>
                )}

                <div className="group h-full rounded-2xl border border-purple-900/50 bg-[#110b20] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(124,58,237,0.15)]">

                  {/* Top */}
                  <div className="flex items-center justify-between">

                    <span className="text-5xl font-black text-purple-900/60">
                      {step.number}
                    </span>

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                      <Icon className="h-7 w-7" />
                    </div>

                  </div>

                  {/* Content */}
                  <h3 className="mt-8 text-2xl font-bold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-purple-200/60">
                    {step.description}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}