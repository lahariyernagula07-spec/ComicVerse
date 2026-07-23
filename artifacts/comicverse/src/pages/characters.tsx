import { useState } from 'react';
import { useAuth } from '@clerk/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, User, X, Check } from 'lucide-react';
import { apiBase } from '../lib/api';
import { useAuthFetch } from '../hooks/useAuthFetch';

const VISUAL_STYLES = ['Manga', 'Superhero', 'Cartoon', 'Chibi', 'Realistic', 'Anime', 'Noir', 'Pixel'];
const PERSONALITY_PRESETS = ['Brave hero', 'Snarky sidekick', 'Wise mentor', 'Cunning villain', 'Gentle giant', 'Mysterious stranger'];

type Character = {
  id: number; name: string; description: string; personality: string; visualStyle: string; avatarUrl?: string | null;
};

function CharacterForm({ initial, onSave, onCancel }: {
  initial?: Partial<Character>;
  onSave: (data: Omit<Character, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    personality: initial?.personality ?? '',
    visualStyle: initial?.visualStyle ?? 'Manga',
    avatarUrl: initial?.avatarUrl ?? '',
  });

  return (
    <div className="bg-cv-card border border-cv-accent/40 rounded-2xl p-6">
      <h3 className="font-bold text-cv-text text-lg mb-4" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.04em' }}>
        {initial?.name ? 'EDIT CHARACTER' : 'NEW CHARACTER'}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-cv-muted mb-1 uppercase tracking-wide">Name *</label>
          <input
            className="w-full bg-cv-surface border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Captain Spark"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-cv-muted mb-1 uppercase tracking-wide">Visual Style</label>
          <div className="flex flex-wrap gap-2">
            {VISUAL_STYLES.map(s => (
              <button
                key={s}
                onClick={() => setForm(f => ({ ...f, visualStyle: s }))}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  form.visualStyle === s
                    ? 'bg-cv-accent border-cv-accent text-white'
                    : 'border-cv-border text-cv-muted hover:border-cv-accent/50'
                }`}
              >{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-cv-muted mb-1 uppercase tracking-wide">Personality</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PERSONALITY_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setForm(f => ({ ...f, personality: p }))}
                className="px-2 py-0.5 rounded text-xs border border-cv-border text-cv-muted hover:border-cv-accent/50 hover:text-cv-text transition-colors"
              >{p}</button>
            ))}
          </div>
          <input
            className="w-full bg-cv-surface border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent"
            value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))}
            placeholder="Describe their personality..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-cv-muted mb-1 uppercase tracking-wide">Appearance / Description</label>
          <textarea
            className="w-full bg-cv-surface border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent resize-none"
            rows={3}
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Tall, wears a red cape, has silver hair..."
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave(form)}
            disabled={!form.name}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cv-accent text-white text-sm font-semibold hover:bg-cv-accent-light disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" /> Save Character
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-cv-border text-cv-muted text-sm hover:text-cv-text transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Characters() {
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Character | null | 'new'>(null);

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => authFetch(`${apiBase}/characters`).then(r => r.json()),
    enabled: !!isSignedIn,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => authFetch(`${apiBase}/characters`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['characters'] }); setEditing(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      authFetch(`${apiBase}/characters/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['characters'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authFetch(`${apiBase}/characters/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['characters'] }),
  });

  if (!isSignedIn) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-cv-muted">Please sign in.</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cv-text" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.05em' }}>CHARACTERS</h1>
          <p className="text-cv-muted mt-1">Build your roster of reusable characters.</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light transition-colors btn-glow"
        >
          <Plus className="w-4 h-4" /> New Character
        </button>
      </div>

      {editing === 'new' && (
        <div className="mb-6">
          <CharacterForm
            onSave={data => createMutation.mutate(data)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-cv-card border border-cv-border rounded-xl h-40 animate-pulse" />)}
        </div>
      ) : characters.length === 0 && editing !== 'new' ? (
        <div className="bg-cv-card border border-cv-border border-dashed rounded-2xl py-16 text-center">
          <User className="w-12 h-12 text-cv-muted mx-auto mb-3" />
          <p className="text-cv-muted mb-4">No characters yet. Create your first hero (or villain)!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char: Character) => (
            editing && (editing as Character).id === char.id ? (
              <div key={char.id} className="sm:col-span-2 lg:col-span-3">
                <CharacterForm
                  initial={char}
                  onSave={data => updateMutation.mutate({ id: char.id, data })}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : (
              <div key={char.id} className="bg-cv-card border border-cv-border rounded-xl p-4 cv-card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-cv-accent/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-cv-accent-light" />
                  </div>
                  <span className="style-tag text-xs">{char.visualStyle}</span>
                </div>
                <h3 className="font-bold text-cv-text mb-1">{char.name}</h3>
                <p className="text-xs text-cv-muted mb-1 line-clamp-1">{char.personality}</p>
                <p className="text-xs text-cv-muted line-clamp-2">{char.description}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <button
                    onClick={() => setEditing(char)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-cv-surface text-cv-text text-xs hover:bg-cv-border transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this character?')) deleteMutation.mutate(char.id); }}
                    className="p-1.5 rounded-lg bg-cv-surface text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
