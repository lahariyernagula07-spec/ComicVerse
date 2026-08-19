import { Link, useLocation } from 'wouter';
import { useAuth, UserButton } from '@clerk/react';
import { BookOpen, Users, Globe, LayoutDashboard, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from '../lib/navigate';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/characters', label: 'Characters', icon: Users },
  { href: '/community', label: 'Community', icon: Globe },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isSignedIn } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-cv-border bg-cv-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cv-accent to-cv-accent-light flex items-center justify-center shadow-cv-glow group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.05em', color: 'var(--color-cv-text)' }}>
              COMICVERSE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.startsWith(href)
                    ? 'bg-cv-accent/20 text-cv-accent-light'
                    : 'text-cv-muted hover:text-cv-text hover:bg-cv-card'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => nav('/editor/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-cv-accent text-white hover:bg-cv-accent-light transition-colors btn-glow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Comic</span>
            </button>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <Link href="/sign-in" className="px-3 py-1.5 rounded-lg text-sm text-cv-muted hover:text-cv-text transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-cv-border bg-cv-surface/95 backdrop-blur-md">
        <div className="flex items-center justify-around h-14">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors ${
                location.startsWith(href) ? 'text-cv-accent-light' : 'text-cv-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
