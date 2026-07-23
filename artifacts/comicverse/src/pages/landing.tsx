import { Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { Sparkles, BookOpen, Users, Globe, Zap, ArrowRight } from 'lucide-react';

const STYLES = ['Manga', 'Marvel', 'Anime', 'Noir', 'Pixel', 'Disney'];
const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Story Generation',
    desc: 'Describe your idea and watch GPT-4 craft a complete panel-by-panel script.',
  },
  {
    icon: BookOpen,
    title: 'Panel Editor',
    desc: 'Arrange panels, add dialogue bubbles, and generate stunning artwork for each scene.',
  },
  {
    icon: Users,
    title: 'Character Creator',
    desc: 'Build a roster of reusable characters with personalities and visual styles.',
  },
  {
    icon: Globe,
    title: 'Community Feed',
    desc: 'Publish your strips, discover others\' work, and give love to your favorites.',
  },
];

export default function Landing() {
  const { isSignedIn } = useAuth();
  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cv-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cv-accent/30 bg-cv-accent/10 text-cv-accent-light text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Comic Creation
          </div>
          <h1
            className="text-6xl md:text-8xl font-bold mb-6 leading-none"
            style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.03em' }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cv-accent to-cv-accent-light">
              COMIC
            </span>
            <span className="text-cv-text">VERSE</span>
          </h1>
          <p className="text-xl text-cv-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Create stunning comic strips with AI. Describe your story, generate panel artwork,
            add your characters, and share with a community of creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isSignedIn ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cv-accent text-white font-semibold text-lg hover:bg-cv-accent-light transition-colors btn-glow">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cv-accent text-white font-semibold text-lg hover:bg-cv-accent-light transition-colors btn-glow">
                  Start Creating Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/community" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cv-border text-cv-text font-semibold text-lg hover:bg-cv-card transition-colors">
                  Browse Comics
                </Link>
              </>
            )}
          </div>

          {/* Style pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-10">
            {STYLES.map(s => (
              <span key={s} className="style-tag px-3 py-1 text-xs">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-cv-card border border-cv-border rounded-xl p-5 cv-card-hover">
              <div className="w-10 h-10 rounded-lg bg-cv-accent/20 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-cv-accent-light" />
              </div>
              <h3 className="font-semibold text-cv-text mb-1">{title}</h3>
              <p className="text-sm text-cv-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!isSignedIn && (
        <section className="max-w-2xl mx-auto px-4 pb-24 text-center">
          <div className="bg-gradient-to-br from-cv-accent/20 to-purple-900/20 border border-cv-accent/30 rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-cv-text mb-3" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.05em' }}>
              Ready to Create?
            </h2>
            <p className="text-cv-muted mb-6">Join and start publishing your comics today.</p>
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light transition-colors btn-glow">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
