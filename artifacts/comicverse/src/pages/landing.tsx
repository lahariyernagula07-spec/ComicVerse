import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import {
  Sparkles,
  BookOpen,
  Users,
  Globe,
  Zap,
  ArrowRight,
  Wand2,
  Palette,
  Layers3,
  Rocket,
  MessageSquare,
  Play,
  Star,
} from 'lucide-react';

const STYLES = [
  'Manga',
  'Superhero',
  'Anime',
  'Noir',
  'Pixel',
  'Cartoon',
];

const FEATURES = [
  {
    icon: Sparkles,
    number: '01',
    title: 'AI Story Generation',
    desc: 'Start with a simple idea and transform it into a complete comic story with structured scenes and dialogue.',
  },
  {
    icon: Palette,
    number: '02',
    title: 'AI Artwork',
    desc: 'Bring your scenes to life with visually engaging artwork designed around your comic story.',
  },
  {
    icon: Users,
    number: '03',
    title: 'Character Creator',
    desc: 'Create memorable characters and build a reusable cast for your comic universe.',
  },
  {
    icon: Globe,
    number: '04',
    title: 'Share & Discover',
    desc: 'Publish your creations, explore the community, and discover stories from other creators.',
  },
];

const STEPS = [
  {
    icon: Wand2,
    step: '01',
    title: 'Imagine',
    desc: 'Describe your idea, characters, world, or the story you want to tell.',
  },
  {
    icon: Layers3,
    step: '02',
    title: 'Create',
    desc: 'Turn your idea into comic panels, dialogue, characters, and artwork.',
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Publish',
    desc: 'Save your comic and share your story with the ComicVerse community.',
  },
];

export default function Landing() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-cv-bg text-cv-text">
      {/* =========================================================
          HERO SECTION
      ========================================================== */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-cv-accent/10 blur-[120px]" />
          <div className="absolute right-[-10%] top-[25%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[35%] h-[400px] w-[400px] rounded-full bg-cv-accent/5 blur-[100px]" />

          {/* Comic-style grid */}
          <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
            {/* Hero content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cv-accent/30 bg-cv-accent/10 px-4 py-2 text-sm font-medium text-cv-accent-light backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                AI-Powered Comic Creation
                <span className="h-1.5 w-1.5 rounded-full bg-cv-accent-light" />
              </div>

              {/* Main heading */}
              <h1
                className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ fontFamily: 'var(--font-cv-display)' }}
              >
                <span className="block text-cv-text">YOUR STORY.</span>

                <span className="block bg-gradient-to-r from-cv-accent via-purple-400 to-cv-accent-light bg-clip-text text-transparent">
                  YOUR WORLD.
                </span>

                <span className="block text-cv-text">YOUR COMIC.</span>
              </h1>

              {/* Description */}
              <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-cv-muted sm:text-lg lg:mx-0">
                Turn your imagination into immersive comic stories. Create
                characters, generate stories, design panels, and share your
                universe with the world.
              </p>

              {/* CTA buttons */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cv-accent px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-cv-accent/20 transition-all duration-300 hover:-translate-y-1 hover:bg-cv-accent-light hover:shadow-xl hover:shadow-cv-accent/30"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-cv-accent px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-cv-accent/20 transition-all duration-300 hover:-translate-y-1 hover:bg-cv-accent-light hover:shadow-xl hover:shadow-cv-accent/30"
                    >
                      <Sparkles className="h-5 w-5" />
                      Start Creating Free
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/community"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-cv-border bg-cv-card/50 px-7 py-3.5 text-base font-semibold text-cv-text backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cv-accent/40 hover:bg-cv-card"
                    >
                      <Play className="h-4 w-4" />
                      Explore Comics
                    </Link>
                  </>
                )}
              </div>

              {/* Trust / quick highlights */}
              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-cv-muted lg:justify-start">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cv-accent-light" />
                  AI-assisted creation
                </div>

                <div className="hidden h-4 w-px bg-cv-border sm:block" />

                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-cv-accent-light" />
                  Panel-based storytelling
                </div>
              </div>
            </div>

            {/* =====================================================
                COMIC PREVIEW
            ====================================================== */}
            <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
              {/* Floating label */}
              <div className="absolute -left-3 -top-5 z-20 hidden rounded-xl border border-cv-border bg-cv-card/90 px-4 py-3 shadow-xl backdrop-blur-md sm:block lg:-left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cv-accent/20">
                    <Sparkles className="h-4 w-4 text-cv-accent-light" />
                  </div>
                  <div>
                    <p className="text-xs text-cv-muted">Powered by</p>
                    <p className="text-sm font-semibold text-cv-text">
                      Your Imagination
                    </p>
                  </div>
                </div>
              </div>

              {/* Main comic window */}
              <div className="relative rounded-3xl border border-cv-border bg-cv-card/60 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-4">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-cv-border px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-cv-muted">
                    <Sparkles className="h-3.5 w-3.5" />
                    Comic Studio
                  </div>

                  <div className="h-6 w-16 rounded-md bg-cv-bg/60" />
                </div>

                {/* Comic panels */}
                <div className="grid gap-3 pt-3 sm:grid-cols-2">
                  {/* Panel 1 */}
                  <div className="group relative min-h-[210px] overflow-hidden rounded-xl border border-cv-border bg-gradient-to-br from-purple-950 via-cv-card to-cv-bg">
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cv-accent/30 blur-3xl" />
                    </div>

                    <div className="absolute left-4 top-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                      PANEL 01
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-cv-accent/30 bg-cv-accent/10">
                        <Sparkles className="h-8 w-8 text-cv-accent-light" />
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur-md">
                        <p className="text-xs italic leading-relaxed text-white/90">
                          "Every great story begins with an idea..."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panel 2 */}
                  <div className="group relative min-h-[210px] overflow-hidden rounded-xl border border-cv-border bg-gradient-to-br from-cv-bg via-purple-950/50 to-cv-card">
                    <div className="absolute inset-0">
                      <div className="absolute left-1/2 top-1/3 h-28 w-28 -translate-x-1/2 rounded-full bg-purple-500/20 blur-2xl" />
                    </div>

                    <div className="absolute left-4 top-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                      PANEL 02
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10">
                        <Wand2 className="h-9 w-9 text-purple-300" />
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center backdrop-blur-md">
                        <p className="text-xs leading-relaxed text-white/90">
                          The story takes shape.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panel 3 */}
                  <div className="group relative min-h-[210px] overflow-hidden rounded-xl border border-cv-border bg-gradient-to-br from-cv-card via-cv-bg to-purple-950/50">
                    <div className="absolute left-4 top-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                      PANEL 03
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="mb-4 flex items-end justify-center gap-3">
                        <div className="h-20 w-12 rounded-t-full border border-cv-accent/20 bg-cv-accent/10" />
                        <div className="h-28 w-16 rounded-t-full border border-purple-400/20 bg-purple-500/10" />
                        <div className="h-16 w-10 rounded-t-full border border-cv-accent/20 bg-cv-accent/10" />
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center backdrop-blur-md">
                        <p className="text-xs leading-relaxed text-white/90">
                          Characters enter the universe.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panel 4 */}
                  <div className="group relative min-h-[210px] overflow-hidden rounded-xl border border-cv-accent/20 bg-gradient-to-br from-cv-accent/20 via-purple-950/50 to-cv-bg">
                    <div className="absolute inset-0">
                      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-cv-accent/20 blur-3xl" />
                    </div>

                    <div className="absolute left-4 top-4 rounded-lg bg-cv-accent/20 px-3 py-2 text-xs font-medium text-cv-accent-light backdrop-blur-md">
                      PANEL 04
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-cv-accent/30 bg-cv-accent/10 shadow-lg shadow-cv-accent/20">
                          <Rocket className="h-10 w-10 text-cv-accent-light" />
                        </div>
                      </div>

                      <div className="rounded-xl border border-cv-accent/20 bg-cv-accent/10 p-3 text-center backdrop-blur-md">
                        <p className="text-xs font-medium text-white">
                          Your universe is ready.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom status */}
                <div className="flex items-center justify-between px-2 pt-3 text-[11px] text-cv-muted">
                  <span>4 panels created</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Ready to create
                  </span>
                </div>
              </div>

              {/* Floating style card */}
              <div className="absolute -bottom-5 -right-3 z-20 rounded-2xl border border-cv-border bg-cv-card/90 p-4 shadow-xl backdrop-blur-xl sm:-right-7">
                <div className="mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-cv-accent-light" />
                  <span className="text-xs font-semibold text-cv-text">
                    Choose your style
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {STYLES.slice(0, 3).map((style) => (
                    <span
                      key={style}
                      className="rounded-md border border-cv-border bg-cv-bg px-2 py-1 text-[10px] text-cv-muted"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURE INTRO
      ========================================================== */}
      <section className="border-y border-cv-border bg-cv-card/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cv-border bg-cv-card px-3 py-1.5 text-xs font-medium text-cv-muted">
              <Zap className="h-3.5 w-3.5 text-cv-accent-light" />
              Everything you need
            </div>

            <h2
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-cv-display)' }}
            >
              FROM IDEA TO COMIC
            </h2>

            <p className="mt-4 text-cv-muted">
              A complete creative workspace designed to help you turn
              imagination into stories worth sharing.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, number, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-cv-border bg-cv-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-cv-accent/40 hover:shadow-xl hover:shadow-cv-accent/5"
              >
                <div className="absolute right-5 top-4 text-4xl font-bold text-white/[0.03]">
                  {number}
                </div>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cv-accent/10 transition-colors group-hover:bg-cv-accent/20">
                  <Icon className="h-5 w-5 text-cv-accent-light" />
                </div>

                <h3 className="text-base font-semibold text-cv-text">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-cv-muted">
                  {desc}
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-medium text-cv-accent-light opacity-0 transition-opacity group-hover:opacity-100">
                  Explore feature
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cv-accent/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* Left */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-cv-accent-light">
                <span className="h-px w-8 bg-cv-accent" />
                SIMPLE CREATIVE FLOW
              </div>

              <h2
                className="text-4xl font-bold leading-tight sm:text-5xl"
                style={{ fontFamily: 'var(--font-cv-display)' }}
              >
                CREATE YOUR
                <span className="block text-cv-accent-light">
                  UNIVERSE.
                </span>
              </h2>

              <p className="mt-5 max-w-md leading-7 text-cv-muted">
                You bring the imagination. ComicVerse gives you the tools to
                transform your ideas into a visual story.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm text-cv-muted">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span>Built for storytellers and creators</span>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {STEPS.map(({ icon: Icon, step, title, desc }, index) => (
                <div
                  key={step}
                  className="group relative flex gap-5 rounded-2xl border border-cv-border bg-cv-card/50 p-5 transition-all duration-300 hover:border-cv-accent/30 hover:bg-cv-card"
                >
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cv-accent/10">
                      <Icon className="h-5 w-5 text-cv-accent-light" />
                    </div>

                    {index !== STEPS.length - 1 && (
                      <div className="mt-2 h-full min-h-8 w-px bg-cv-border" />
                    )}
                  </div>

                  <div className="pb-2">
                    <div className="mb-1 text-xs font-semibold tracking-widest text-cv-accent-light">
                      STEP {step}
                    </div>

                    <h3 className="text-lg font-semibold text-cv-text">
                      {title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-cv-muted">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      {!isSignedIn && (
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-cv-accent/30 bg-gradient-to-br from-cv-accent/20 via-purple-950/30 to-cv-card p-8 text-center shadow-2xl shadow-cv-accent/5 sm:p-12 lg:p-16">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-cv-accent/20 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-500/20 blur-[80px]" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cv-accent/30 bg-cv-accent/10">
                <MessageSquare className="h-6 w-6 text-cv-accent-light" />
              </div>

              <h2
                className="text-3xl font-bold sm:text-4xl lg:text-5xl"
                style={{ fontFamily: 'var(--font-cv-display)' }}
              >
                YOUR NEXT STORY
                <span className="block text-cv-accent-light">
                  STARTS HERE.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-cv-muted">
                Stop waiting for the perfect moment. Start with an idea and
                build your own comic universe today.
              </p>

              <Link
                href="/sign-up"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-cv-accent px-8 py-4 font-semibold text-white shadow-lg shadow-cv-accent/20 transition-all duration-300 hover:-translate-y-1 hover:bg-cv-accent-light hover:shadow-xl hover:shadow-cv-accent/30"
              >
                <Sparkles className="h-5 w-5" />
                Start Creating Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}