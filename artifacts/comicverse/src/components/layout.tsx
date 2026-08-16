import { Link, useLocation } from 'wouter';
import { useAuth, UserButton } from '@clerk/react';
import {
  Users,
  Globe,
  LayoutDashboard,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '../lib/navigate';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/characters',
    label: 'Characters',
    icon: Users,
  },
  {
    href: '/community',
    label: 'Community',
    icon: Globe,
  },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const { isSignedIn } = useAuth();
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    nav(path);
  };

  return (
    <div className="min-h-screen bg-cv-bg text-cv-text">
      {/* =====================================================
          DESKTOP / TOP NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-cv-border/70 bg-cv-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

         {/* LOGO */}
<Link
  href="/"
  className="group flex shrink-0 items-center"
  aria-label="ComicVerse Home"
>
  <img
    src="/comicverse-logo.png"
    alt="ComicVerse"
    className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
  />
</Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = location.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cv-accent/15 text-cv-accent-light'
                      : 'text-cv-muted hover:bg-cv-card hover:text-cv-text'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? 'text-cv-accent-light'
                        : 'text-cv-muted'
                    }`}
                  />

                  {label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-2">

            {/* CREATE COMIC */}
            <button
              onClick={() => handleNavigation('/editor/new')}
              className="flex items-center gap-2 rounded-xl bg-cv-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cv-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cv-accent-light hover:shadow-xl hover:shadow-cv-accent/30"
            >
              <Plus className="h-4 w-4" />

              <span className="hidden sm:inline">
                Create Comic
              </span>
            </button>

            {/* USER / SIGN IN */}
            {isSignedIn ? (
              <div className="ml-1">
                <UserButton />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-cv-muted transition-colors hover:bg-cv-card hover:text-cv-text sm:block"
              >
                Sign In
              </Link>
            )}

            {/* MOBILE MENU BUTTON */}
               <Link
  href="/editor/new"
  onClick={() => setMobileMenuOpen(false)}
  className="flex items-center gap-2 rounded-xl bg-cv-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cv-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cv-accent-light hover:shadow-xl hover:shadow-cv-accent/30"
>
  <Plus className="h-4 w-4" />

  <span className="hidden sm:inline">
    Create Comic
  </span>
</Link>       </div>
        </div>

        {/* =================================================
            MOBILE DROPDOWN MENU
        ================================================== */}
        {mobileMenuOpen && (
          <div className="border-t border-cv-border bg-cv-surface/95 backdrop-blur-xl md:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

              <nav className="flex flex-col gap-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = location.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-cv-accent/15 text-cv-accent-light'
                          : 'text-cv-muted hover:bg-cv-card hover:text-cv-text'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {!isSignedIn && (
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center justify-center rounded-xl border border-cv-border px-4 py-3 text-sm font-medium text-cv-muted transition-colors hover:bg-cv-card hover:text-cv-text"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}