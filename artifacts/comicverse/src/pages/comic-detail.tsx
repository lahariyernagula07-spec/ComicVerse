import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/react';
import { Link } from 'wouter';
import { Heart, ArrowLeft, User, BookOpen } from 'lucide-react';
import { apiBase } from '../lib/api';
import { useAuthFetch } from '../hooks/useAuthFetch';

export default function ComicDetail({ comicId }: { comicId: number }) {
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const qc = useQueryClient();

  const { data: comic, isLoading } = useQuery({
    queryKey: ['community-comic', comicId],
    queryFn: () => fetch(`${apiBase}/community/comics/${comicId}`).then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); }),
  });

  const likeMutation = useMutation({
    mutationFn: () => authFetch(`${apiBase}/community/comics/${comicId}/like`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-comic', comicId] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cv-card rounded w-1/3" />
          <div className="h-4 bg-cv-card rounded w-1/5" />
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-cv-card rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-cv-muted mb-4">Comic not found.</p>
          <Link href="/community" className="text-cv-accent-light hover:underline">← Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/community" className="inline-flex items-center gap-1 text-cv-muted hover:text-cv-text text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-cv-text mb-2" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.04em' }}>{comic.title}</h1>
            <div className="flex items-center gap-3 text-sm text-cv-muted">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {comic.authorName}</span>
              <span className="style-tag">{comic.style}</span>
              <span>{comic.template}</span>
            </div>
            {comic.description && <p className="text-cv-muted mt-2 max-w-2xl">{comic.description}</p>}
          </div>
          <button
            onClick={() => isSignedIn && likeMutation.mutate()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              comic.userHasLiked
                ? 'border-pink-400 text-pink-400 bg-pink-400/10'
                : 'border-cv-border text-cv-muted hover:border-pink-400 hover:text-pink-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${comic.userHasLiked ? 'fill-current' : ''}`} />
            {comic.likesCount}
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(comic.panels ?? []).map((panel: any, i: number) => (
          <div key={panel.id} className="bg-cv-card border border-cv-border rounded-xl overflow-hidden panel-border">
            <div className="h-56 bg-cv-surface relative halftone">
              {panel.imageData ? (
                <img src={`data:image/jpeg;base64,${panel.imageData}`} alt={`Panel ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-cv-border" />
                </div>
              )}
              <div className="absolute top-2 left-2 bg-cv-ink/70 text-white text-xs font-bold px-2 py-0.5 rounded">
                {i + 1}
              </div>
            </div>
            <div className="p-3 space-y-2">
              {panel.caption && (
                <p className="text-xs text-cv-muted italic border-l-2 border-cv-accent pl-2">{panel.caption}</p>
              )}
              {panel.dialogue && (
                <div className="speech-bubble px-3 py-2 text-sm">{panel.dialogue}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
