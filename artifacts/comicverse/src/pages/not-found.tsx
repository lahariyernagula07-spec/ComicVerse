import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-cv-accent/30 mb-4" style={{ fontFamily: 'var(--font-cv-display)' }}>404</div>
        <h1 className="text-2xl font-bold text-cv-text mb-2">Page Not Found</h1>
        <p className="text-cv-muted mb-6">This panel doesn't exist in the story.</p>
        <Link href="/" className="px-4 py-2 rounded-lg bg-cv-accent text-white font-medium hover:bg-cv-accent-light transition-colors">
          ← Back Home
        </Link>
      </div>
    </div>
  );
}
