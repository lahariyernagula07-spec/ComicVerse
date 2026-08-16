import { useAuth } from '@clerk/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Plus, BookOpen, Heart, Users, Eye, Pencil, Trash2, Globe, Lock } from 'lucide-react';
import { useNavigate } from '../lib/navigate';
import { apiBase } from '../lib/api';
import { useAuthFetch } from '../hooks/useAuthFetch';

export default function Dashboard() {
  const { isSignedIn } = useAuth();
  const nav = useNavigate();
  const authFetch = useAuthFetch();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () =>
      authFetch(`${apiBase}/dashboard/stats`).then((r) => r.json()),
    enabled: !!isSignedIn,
  });

  const { data: comics = [], isLoading } = useQuery({
    queryKey: ['my-comics'],
    queryFn: () =>
      authFetch(`${apiBase}/comics`).then((r) => r.json()),
    enabled: !!isSignedIn,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      authFetch(`${apiBase}/comics/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-comics'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({
      id,
      published,
    }: {
      id: number;
      published: boolean;
    }) =>
      authFetch(`${apiBase}/comics/${id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ published }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-comics'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-cv-muted mb-4">
            Sign in to access your dashboard.
          </p>

          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-lg bg-cv-accent text-white font-medium hover:bg-cv-accent-light transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Comics',
      value: stats?.totalComics ?? 0,
      icon: BookOpen,
      color: 'text-cv-accent-light',
    },
    {
      label: 'Published',
      value: stats?.publishedComics ?? 0,
      icon: Globe,
      color: 'text-green-400',
    },
    {
      label: 'Likes Received',
      value: stats?.totalLikesReceived ?? 0,
      icon: Heart,
      color: 'text-pink-400',
    },
    {
      label: 'Characters',
      value: stats?.totalCharacters ?? 0,
      icon: Users,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold text-cv-text"
            style={{
              fontFamily: 'var(--font-cv-display)',
              letterSpacing: '0.05em',
            }}
          >
            MY DASHBOARD
          </h1>

          <p className="text-cv-muted mt-1">
            Your comics, stats, and creations.
          </p>
        </div>

        <button
          onClick={() => nav('/editor/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light transition-colors btn-glow"
        >
          <Plus className="w-4 h-4" />
          New Comic
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-cv-card border border-cv-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />

              <span className="text-xs text-cv-muted font-medium uppercase tracking-wide">
                {label}
              </span>
            </div>

            <p className="text-2xl font-bold text-cv-text">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Comics */}
      <h2 className="text-lg font-semibold text-cv-text mb-4">
        My Comics
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-cv-card border border-cv-border rounded-xl h-52 animate-pulse"
            />
          ))}
        </div>
      ) : comics.length === 0 ? (
        <div className="bg-cv-card border border-cv-border border-dashed rounded-2xl py-16 text-center">
          <BookOpen className="w-12 h-12 text-cv-muted mx-auto mb-3" />

          <p className="text-cv-muted mb-4">
            No comics yet. Create your first one!
          </p>

          <button
            onClick={() => nav('/editor/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Comic
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {comics.map((comic: any) => (
            <div
              key={comic.id}
              className="bg-cv-card border border-cv-border rounded-xl overflow-hidden cv-card-hover group"
            >

              {/* Cover */}
              <div className="h-32 bg-gradient-to-br from-cv-surface to-cv-card relative overflow-hidden halftone">

                {comic.coverImageData ? (
                  <img
                    src={`data:image/png;base64,${comic.coverImageData}`}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-cv-border" />
                  </div>
                )}

                {/* Published / Draft badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`style-tag ${
                      comic.published
                        ? 'bg-green-500/80'
                        : 'bg-cv-muted/50'
                    } text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                  >
                    {comic.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Comic details */}
              <div className="p-4">

                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-cv-text text-sm leading-tight line-clamp-1">
                    {comic.title}
                  </h3>

                  <span className="style-tag text-xs shrink-0">
                    {comic.style}
                  </span>
                </div>

                <p className="text-xs text-cv-muted mb-3 flex items-center gap-2">
                  <Heart className="w-3 h-3" />
                  {comic.likesCount} · {comic.template}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1.5">

                  {/* Edit */}
                  <button
                    onClick={() => nav(`/editor/${comic.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-cv-surface text-cv-text text-xs font-medium hover:bg-cv-border transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>

                  {/* Publish / Unpublish */}
                  <button
                    onClick={() =>
                      publishMutation.mutate({
                        id: comic.id,
                        published: !comic.published,
                      })
                    }
                    className="flex items-center justify-center p-1.5 rounded-lg bg-cv-surface text-cv-muted hover:text-cv-text hover:bg-cv-border transition-colors"
                  >
                    {comic.published ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                  </button>

                  {/* View Published Comic */}
                  {comic.published && (
                    <Link href={`/comic/${comic.id}`}>
                      <button
                        className="flex items-center justify-center p-1.5 rounded-lg bg-cv-surface text-cv-muted hover:text-cv-text hover:bg-cv-border transition-colors"
                        title="View published comic"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </Link>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm('Delete this comic?')) {
                        deleteMutation.mutate(comic.id);
                      }
                    }}
                    className="flex items-center justify-center p-1.5 rounded-lg bg-cv-surface text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}