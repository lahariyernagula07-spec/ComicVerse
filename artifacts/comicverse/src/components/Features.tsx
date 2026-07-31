import {
  Sparkles,
  Palette,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Story Generation",
    description:
      "Turn a simple idea into an engaging comic story with scenes and dialogue.",
  },
  {
    icon: Palette,
    title: "AI Artwork",
    description:
      "Bring your characters and scenes to life with beautiful AI-generated artwork.",
  },
  {
    icon: Users,
    title: "Character Creator",
    description:
      "Create unique characters and build your own reusable comic universe.",
  },
  {
    icon: Globe,
    title: "Share & Discover",
    description:
      "Publish your comics, connect with creators, and discover new stories.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-[#0d0818] px-6 py-24 text-white lg:px-8"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-400">
            Everything You Need
          </p>

          <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            Bring Your Ideas
            <span className="text-purple-400"> To Life.</span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-400">
            ComicVerse gives you powerful tools to transform your imagination
            into incredible visual stories.
          </p>

        </div>

        {/* CARDS */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-purple-900/40 bg-[#140c22] p-7 transition duration-300 hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-900/20"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10">
                  <Icon className="h-7 w-7 text-purple-400" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-400">
                  {feature.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}