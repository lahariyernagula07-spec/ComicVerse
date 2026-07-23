import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/react';
import { Link } from 'wouter';
import {
  Sparkles, Plus, Trash2, ArrowLeft, Image, MessageSquare,
  Save, Globe, Lock, ChevronUp, ChevronDown, Loader2, BookOpen
} from 'lucide-react';
import { apiBase } from '../lib/api';
import { useAuthFetch } from '../hooks/useAuthFetch';
import { useNavigate } from '../lib/navigate';

const STYLES = ['manga', 'marvel', 'anime', 'cartoon', 'pixel', 'webtoon', 'disney', 'noir'];
const TEMPLATES = ['4-panel', 'webtoon', 'newspaper', 'single-page', '6-panel'];

type Panel = {
  id: number; comicId: number; order: number;
  dialogue?: string | null; caption?: string | null;
  imageData?: string | null; imagePrompt?: string | null;
  characterIds: number[];
};

type Comic = {
  id: number; title: string; description?: string | null;
  style: string; template: string; published: boolean;
  coverImageData?: string | null; panels: Panel[];
};

type Character = { id: number; name: string; visualStyle: string; personality: string; description: string };

// ── AI Panel Card ──────────────────────────────────────────────────────────────
function PanelCard({
  panel, index, total, comic, characters, onUpdate, onDelete, onMove, onGenerateImage, onGenerateDialogue
}: {
  panel: Panel; index: number; total: number; comic: Comic; characters: Character[];
  onUpdate: (id: number, data: Partial<Panel>) => void;
  onDelete: (id: number) => void;
  onMove: (id: number, dir: 'up' | 'down') => void;
  onGenerateImage: (panel: Panel) => void;
  onGenerateDialogue: (panel: Panel) => void;
}) {
  const [localDialogue, setLocalDialogue] = useState(panel.dialogue ?? '');
  const [localCaption, setLocalCaption] = useState(panel.caption ?? '');
  const [localPrompt, setLocalPrompt] = useState(panel.imagePrompt ?? '');
  const [generatingImg, setGeneratingImg] = useState(false);
  const [generatingDlg, setGeneratingDlg] = useState(false);

  useEffect(() => { setLocalDialogue(panel.dialogue ?? ''); }, [panel.dialogue]);
  useEffect(() => { setLocalCaption(panel.caption ?? ''); }, [panel.caption]);
  useEffect(() => { setLocalPrompt(panel.imagePrompt ?? ''); }, [panel.imagePrompt]);

  const selectedChars = characters.filter(c => panel.characterIds.includes(c.id));

  return (
    <div className="bg-cv-card border border-cv-border rounded-xl overflow-hidden">
      {/* Panel image area */}
      <div className="h-48 bg-cv-surface relative halftone group">
        {panel.imageData ? (
          <img src={`data:image/jpeg;base64,${panel.imageData}`} alt={`Panel ${index + 1}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-cv-muted">
            <BookOpen className="w-8 h-8" />
            <span className="text-xs">No image yet</span>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-cv-ink/70 text-white text-xs font-bold px-2 py-0.5 rounded">
          Panel {index + 1}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onMove(panel.id, 'up')}
            disabled={index === 0}
            className="p-1 rounded bg-cv-ink/70 text-white hover:bg-cv-accent/80 disabled:opacity-30 transition-colors"
          ><ChevronUp className="w-3 h-3" /></button>
          <button
            onClick={() => onMove(panel.id, 'down')}
            disabled={index === total - 1}
            className="p-1 rounded bg-cv-ink/70 text-white hover:bg-cv-accent/80 disabled:opacity-30 transition-colors"
          ><ChevronDown className="w-3 h-3" /></button>
          <button
            onClick={() => { if (confirm('Delete this panel?')) onDelete(panel.id); }}
            className="p-1 rounded bg-cv-ink/70 text-red-400 hover:bg-red-900/80 transition-colors"
          ><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Image prompt */}
        <div>
          <label className="block text-xs text-cv-muted mb-1 uppercase tracking-wide font-medium">Image Prompt</label>
          <div className="flex gap-1.5">
            <input
              className="flex-1 bg-cv-surface border border-cv-border rounded-lg px-2 py-1.5 text-cv-text text-xs focus:outline-none focus:border-cv-accent"
              value={localPrompt}
              onChange={e => setLocalPrompt(e.target.value)}
              onBlur={() => onUpdate(panel.id, { imagePrompt: localPrompt })}
              placeholder="Describe the scene..."
            />
            <button
              onClick={async () => {
                onUpdate(panel.id, { imagePrompt: localPrompt });
                setGeneratingImg(true);
                await onGenerateImage({ ...panel, imagePrompt: localPrompt });
                setGeneratingImg(false);
              }}
              disabled={generatingImg || !localPrompt}
              className="p-1.5 rounded-lg bg-cv-accent/20 text-cv-accent-light hover:bg-cv-accent/40 disabled:opacity-40 transition-colors"
              title="Generate image"
            >
              {generatingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dialogue */}
        <div>
          <label className="block text-xs text-cv-muted mb-1 uppercase tracking-wide font-medium">Dialogue</label>
          <div className="flex gap-1.5">
            <textarea
              className="flex-1 bg-cv-surface border border-cv-border rounded-lg px-2 py-1.5 text-cv-text text-xs focus:outline-none focus:border-cv-accent resize-none"
              rows={2}
              value={localDialogue}
              onChange={e => setLocalDialogue(e.target.value)}
              onBlur={() => onUpdate(panel.id, { dialogue: localDialogue })}
              placeholder="Character speech..."
            />
            <button
              onClick={async () => {
                setGeneratingDlg(true);
                await onGenerateDialogue({ ...panel, imagePrompt: localPrompt });
                setGeneratingDlg(false);
              }}
              disabled={generatingDlg}
              className="p-1.5 rounded-lg bg-purple-900/30 text-purple-300 hover:bg-purple-900/60 disabled:opacity-40 transition-colors self-start"
              title="Generate dialogue with AI"
            >
              {generatingDlg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs text-cv-muted mb-1 uppercase tracking-wide font-medium">Caption</label>
          <input
            className="w-full bg-cv-surface border border-cv-border rounded-lg px-2 py-1.5 text-cv-text text-xs focus:outline-none focus:border-cv-accent"
            value={localCaption}
            onChange={e => setLocalCaption(e.target.value)}
            onBlur={() => onUpdate(panel.id, { caption: localCaption })}
            placeholder="Narration text..."
          />
        </div>

        {/* Characters */}
        <div>
          <label className="block text-xs text-cv-muted mb-1 uppercase tracking-wide font-medium">Characters</label>
          <div className="flex flex-wrap gap-1">
            {characters.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  const ids = panel.characterIds.includes(c.id)
                    ? panel.characterIds.filter(x => x !== c.id)
                    : [...panel.characterIds, c.id];
                  onUpdate(panel.id, { characterIds: ids });
                }}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  panel.characterIds.includes(c.id)
                    ? 'bg-cv-accent/20 border-cv-accent text-cv-accent-light'
                    : 'border-cv-border text-cv-muted hover:border-cv-accent/50'
                }`}
              >{c.name}</button>
            ))}
            {characters.length === 0 && (
              <Link href="/characters">
                <span className="text-xs text-cv-muted hover:text-cv-accent-light cursor-pointer">+ Add characters</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Story Modal ──────────────────────────────────────────────────────────────
function StoryModal({ comic, characters, onApply, onClose }: {
  comic: Comic; characters: Character[];
  onApply: (story: any) => void; onClose: () => void;
}) {
  const authFetch = useAuthFetch();
  const [prompt, setPrompt] = useState('');
  const [panelCount, setPanelCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!prompt) return;
    setLoading(true); setError('');
    try {
      const res = await authFetch(`${apiBase}/ai/generate-story`, {
        method: 'POST',
        body: JSON.stringify({
          prompt, style: comic.style, panelCount,
          characterNames: characters.map(c => c.name),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message ?? 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cv-surface border border-cv-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cv-text" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.04em' }}>
              AI STORY GENERATOR
            </h2>
            <button onClick={onClose} className="text-cv-muted hover:text-cv-text">✕</button>
          </div>

          {!result ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cv-muted mb-1 uppercase tracking-wide font-medium">Story Premise *</label>
                <textarea
                  className="w-full bg-cv-card border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent resize-none"
                  rows={3}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. A robot discovers they have feelings while working at a coffee shop..."
                />
              </div>
              <div>
                <label className="block text-xs text-cv-muted mb-1 uppercase tracking-wide font-medium">Panels: {panelCount}</label>
                <input type="range" min={2} max={8} value={panelCount} onChange={e => setPanelCount(+e.target.value)}
                  className="w-full accent-purple-500" />
              </div>
              <div className="text-xs text-cv-muted bg-cv-card rounded-lg p-3">
                <strong className="text-cv-text">Style:</strong> {comic.style} · 
                <strong className="text-cv-text"> Characters:</strong> {characters.length > 0 ? characters.map(c => c.name).join(', ') : 'None'}
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={generate}
                  disabled={loading || !prompt}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light disabled:opacity-50 transition-colors"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Story</>}
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-xl border border-cv-border text-cv-muted hover:text-cv-text transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-cv-card rounded-xl p-4">
                <h3 className="font-bold text-cv-text mb-1">{result.title}</h3>
                <p className="text-sm text-cv-muted">{result.description}</p>
              </div>
              <div className="space-y-2">
                {result.panels?.map((p: any, i: number) => (
                  <div key={i} className="bg-cv-card rounded-lg p-3 text-sm">
                    <p className="text-xs text-cv-muted font-medium mb-1">Panel {p.order}</p>
                    {p.caption && <p className="text-cv-muted italic text-xs mb-1">{p.caption}</p>}
                    {p.dialogue && <p className="text-cv-text mb-1">"{p.dialogue}"</p>}
                    <p className="text-xs text-purple-300">[{p.imagePrompt}]</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onApply(result)}
                  className="flex-1 py-2.5 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light transition-colors"
                >
                  Apply to Comic
                </button>
                <button onClick={() => setResult(null)} className="px-4 py-2 rounded-xl border border-cv-border text-cv-muted hover:text-cv-text transition-colors">
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ──────────────────────────────────────────────────────────────
export default function Editor({ comicId }: { comicId: number | null }) {
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  // Local comic state for new comics
  const [newComicForm, setNewComicForm] = useState({ title: '', style: 'manga', template: '4-panel' });
  const [createdId, setCreatedId] = useState<number | null>(null);

  const effectiveId = comicId ?? createdId;

  const { data: comic, isLoading } = useQuery({
    queryKey: ['comic-edit', effectiveId],
    queryFn: () => authFetch(`${apiBase}/comics/${effectiveId}`).then(r => r.json()),
    enabled: !!effectiveId && !!isSignedIn,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => authFetch(`${apiBase}/characters`).then(r => r.json()),
    enabled: !!isSignedIn,
  });

  const createComicMutation = useMutation({
    mutationFn: (data: any) => authFetch(`${apiBase}/comics`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: (data) => {
      setCreatedId(data.id);
      nav(`/editor/${data.id}`, { replace: true });
      qc.invalidateQueries({ queryKey: ['my-comics'] });
    },
  });

  const updateComicMutation = useMutation({
    mutationFn: (data: any) => authFetch(`${apiBase}/comics/${effectiveId}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['comic-edit', effectiveId] }); setUnsaved(false); },
  });

  const createPanelMutation = useMutation({
    mutationFn: (data: any) => authFetch(`${apiBase}/comics/${effectiveId}/panels`, { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comic-edit', effectiveId] }),
  });

  const updatePanelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      authFetch(`${apiBase}/panels/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comic-edit', effectiveId] }),
  });

  const deletePanelMutation = useMutation({
    mutationFn: (id: number) => authFetch(`${apiBase}/panels/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comic-edit', effectiveId] }),
  });

  const publishMutation = useMutation({
    mutationFn: (published: boolean) =>
      authFetch(`${apiBase}/comics/${effectiveId}/publish`, { method: 'POST', body: JSON.stringify({ published }) }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comic-edit', effectiveId] }),
  });

  if (!isSignedIn) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-cv-muted">Please sign in to use the editor.</p></div>;
  }

  // New comic form
  if (!effectiveId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => nav('/dashboard')} className="text-cv-muted hover:text-cv-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-cv-text" style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.05em' }}>NEW COMIC</h1>
        </div>
        <div className="bg-cv-card border border-cv-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">Title *</label>
            <input
              className="w-full bg-cv-surface border border-cv-border rounded-xl px-4 py-2.5 text-cv-text focus:outline-none focus:border-cv-accent"
              value={newComicForm.title}
              onChange={e => setNewComicForm(f => ({ ...f, title: e.target.value }))}
              placeholder="My Awesome Comic"
            />
          </div>
          <div>
            <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">Art Style</label>
            <div className="grid grid-cols-4 gap-2">
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setNewComicForm(f => ({ ...f, style: s }))}
                  className={`py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                    newComicForm.style === s
                      ? 'bg-cv-accent border-cv-accent text-white'
                      : 'border-cv-border text-cv-muted hover:border-cv-accent/50'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">Template</label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t}
                  onClick={() => setNewComicForm(f => ({ ...f, template: t }))}
                  className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                    newComicForm.template === t
                      ? 'bg-cv-accent border-cv-accent text-white'
                      : 'border-cv-border text-cv-muted hover:border-cv-accent/50'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
          <button
            onClick={() => createComicMutation.mutate(newComicForm)}
            disabled={!newComicForm.title || createComicMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light disabled:opacity-50 transition-colors btn-glow"
          >
            {createComicMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create & Open Editor
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-cv-accent" /></div>;
  }

  if (!comic) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-cv-muted">Comic not found.</p></div>;
  }

  const panels: Panel[] = (comic.panels ?? []).sort((a: Panel, b: Panel) => a.order - b.order);

  const handleUpdatePanel = (id: number, data: Partial<Panel>) => {
    updatePanelMutation.mutate({ id, data });
  };

  const handleMovePanel = (id: number, dir: 'up' | 'down') => {
    const idx = panels.findIndex(p => p.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === panels.length - 1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    updatePanelMutation.mutate({ id: panels[idx].id, data: { order: panels[swapIdx].order } });
    updatePanelMutation.mutate({ id: panels[swapIdx].id, data: { order: panels[idx].order } });
  };

  const handleGenerateImage = async (panel: Panel) => {
    const res = await authFetch(`${apiBase}/ai/generate-image`, {
      method: 'POST',
      body: JSON.stringify({
        prompt: panel.imagePrompt || panel.caption || 'comic panel scene',
        style: comic.style,
        panelDescription: panel.caption,
      }),
    });
    if (res.ok) {
      const { imageData } = await res.json();
      updatePanelMutation.mutate({ id: panel.id, data: { imageData } });
    }
  };

  const handleGenerateDialogue = async (panel: Panel) => {
    const selectedChars = characters.filter((c: Character) => panel.characterIds.includes(c.id));
    const res = await authFetch(`${apiBase}/ai/generate-dialogue`, {
      method: 'POST',
      body: JSON.stringify({
        panelDescription: panel.imagePrompt || panel.caption || 'scene',
        characterNames: selectedChars.map((c: Character) => c.name),
        style: comic.style,
      }),
    });
    if (res.ok) {
      const { dialogue, caption } = await res.json();
      updatePanelMutation.mutate({ id: panel.id, data: { dialogue, caption } });
    }
  };

  const handleApplyStory = async (story: any) => {
    // Update comic title/description
    updateComicMutation.mutate({ title: story.title, description: story.description });
    // Create panels
    for (const p of story.panels) {
      await createPanelMutation.mutateAsync({
        order: p.order,
        caption: p.caption,
        dialogue: p.dialogue,
        imagePrompt: p.imagePrompt,
        characterIds: [],
      });
    }
    setShowStoryModal(false);
    qc.invalidateQueries({ queryKey: ['comic-edit', effectiveId] });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => nav('/dashboard')} className="text-cv-muted hover:text-cv-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <input
            className="bg-transparent text-2xl font-bold text-cv-text focus:outline-none border-b border-transparent focus:border-cv-accent pb-0.5 w-full"
            style={{ fontFamily: 'var(--font-cv-display)', letterSpacing: '0.04em' }}
            defaultValue={comic.title}
            onBlur={e => { if (e.target.value !== comic.title) updateComicMutation.mutate({ title: e.target.value }); }}
          />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="style-tag">{comic.style}</span>
            <span className="text-xs text-cv-muted">{comic.template}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cv-accent/40 text-cv-accent-light text-sm hover:bg-cv-accent/10 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> AI Story
          </button>
          <button
            onClick={() => createPanelMutation.mutate({ order: panels.length, characterIds: [] })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cv-surface border border-cv-border text-cv-text text-sm hover:bg-cv-card transition-colors"
          >
            <Plus className="w-4 h-4" /> Panel
          </button>
          <button
            onClick={() => publishMutation.mutate(!comic.published)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              comic.published
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                : 'bg-cv-surface border border-cv-border text-cv-muted hover:text-cv-text'
            }`}
          >
            {comic.published ? <><Globe className="w-4 h-4" /> Published</> : <><Lock className="w-4 h-4" /> Draft</>}
          </button>
        </div>
      </div>

      {/* Panels grid */}
      {panels.length === 0 ? (
        <div className="bg-cv-card border border-cv-border border-dashed rounded-2xl py-20 text-center">
          <BookOpen className="w-12 h-12 text-cv-muted mx-auto mb-3" />
          <p className="text-cv-muted mb-4">No panels yet. Generate a story or add a panel manually.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowStoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light transition-colors btn-glow"
            >
              <Sparkles className="w-4 h-4" /> Generate with AI
            </button>
            <button
              onClick={() => createPanelMutation.mutate({ order: 0, characterIds: [] })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cv-border text-cv-text font-medium hover:bg-cv-card transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Panel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {panels.map((panel, i) => (
            <PanelCard
              key={panel.id}
              panel={panel}
              index={i}
              total={panels.length}
              comic={comic}
              characters={characters}
              onUpdate={handleUpdatePanel}
              onDelete={id => deletePanelMutation.mutate(id)}
              onMove={handleMovePanel}
              onGenerateImage={handleGenerateImage}
              onGenerateDialogue={handleGenerateDialogue}
            />
          ))}
          {/* Add panel button */}
          <button
            onClick={() => createPanelMutation.mutate({ order: panels.length, characterIds: [] })}
            className="bg-cv-card border border-cv-border border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-2 text-cv-muted hover:text-cv-text hover:border-cv-accent/50 transition-colors"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm">Add Panel</span>
          </button>
        </div>
      )}

      {showStoryModal && (
        <StoryModal
          comic={comic}
          characters={characters}
          onApply={handleApplyStory}
          onClose={() => setShowStoryModal(false)}
        />
      )}
    </div>
  );
}
