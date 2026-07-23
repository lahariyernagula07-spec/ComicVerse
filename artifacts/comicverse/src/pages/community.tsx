import { useState } from 'react';
import { useAuth } from '@clerk/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Heart, BookOpen, User, Filter } from 'lucide-react';
import { apiBase } from '../lib/api';
import { useAuthFetch } from '../hooks/useAuthFetch';

const STYLES = ['All', 'manga', 'marvel', 'anime', 'cartoon', 'pixel', 'webtoon', 'disney', 'noir'];

export default function Community() {
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [styleFilter, setStyleFilter] = useState('All');

  const params = new URLSearchParams({ page: String(page), limit: '12' });
  if (styleFilter !== 'All') params.set('style', styleFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['community-feed', page, styleFilter],
    queryFn: () => fetch(`${apiBase}/community/feed?${params}`).then(r => r.json()),
  });

  const likeMutation = useMutation({
    mutationFn: (id: number) => authFetch(`${apiBase}/community/comics/${id}/like`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-feed'] }),
  });

  const comics = data?.comics ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cv-text" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.05em' }}>COMMUNITY</h1>
          <p className="text-cv-muted mt-1">{data?.total ?? 0} published comics</p>
        </div>
      </div>

      {/* Style filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-cv-muted shrink-0" />
        {STYLES.map(s => (
          <button
            key={s}
            onClick={() => { setStyleFilter(s); setPage(1); }}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
              styleFilter === s
                ? 'bg-cv-accent border-cv-accent text-white'
                : 'border-cv-border text-cv-muted hover:border-cv-accent/50'
            }`}
          >{s}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-cv-card border border-cv-border rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : comics.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-cv-muted mx-auto mb-3" />
          <p className="text-cv-muted">No comics here yet. Be the first to publish!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {comics.map((comic: any) => (
              <Link key={comic.id} href={`/community/${comic.id}`}>
                <div className="bg-cv-card border border-cv-border rounded-xl overflow-hidden cv-card-hover cursor-pointer">
                  <div className="h-40 bg-gradient-to-br from-cv-surface to-cv-card relative halftone">
                    {comic.coverImageData ? (
                      <img src={`data:image/png;base64,${comic.coverImageData}`} alt={comic.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-cv-border" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="style-tag">{comic.style}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-cv-text text-sm line-clamp-1 mb-1">{comic.title}</h3>
                    <div className="flex items-center justify-between text-xs text-cv-muted">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {comic.authorName}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isSignedIn) return;
                          likeMutation.mutate(comic.id);
                        }}
                        className={`flex items-center gap-1 transition-colors ${comic.userHasLiked ? 'text-pink-400' : 'hover:text-pink-400'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comic.userHasLiked ? 'fill-current' : ''}`} />
                        {comic.likesCount}
                      </button>
                    </div>
                    <p className="text-xs text-cv-muted mt-1">{comic.panelCount} panels · {comic.template}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-cv-border text-cv-muted text-sm hover:text-cv-text disabled:opacity-40 transition-colors"
              >← Prev</button>
              <span className="text-cv-muted text-sm">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-cv-border text-cv-muted text-sm hover:text-cv-text disabled:opacity-40 transition-colors"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
