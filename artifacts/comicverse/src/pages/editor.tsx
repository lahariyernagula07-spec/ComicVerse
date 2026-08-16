import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { Link } from "wouter";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  Globe,
  Lock,
  ChevronUp,
  ChevronDown,
  Loader2,
  BookOpen,
  AlertCircle,
} from "lucide-react";

import { apiBase } from "../lib/api";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { useNavigate } from "../lib/navigate";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const STYLES = [
  "manga",
  "marvel",
  "anime",
  "cartoon",
  "pixel",
  "webtoon",
  "disney",
  "noir",
];

const TEMPLATES = [
  "4-panel",
  "webtoon",
  "newspaper",
  "single-page",
  "6-panel",
];

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Panel = {
  id: number;
  comicId: number;
  order: number;
  dialogue?: string | null;
  caption?: string | null;
  imageData?: string | null;
  imagePrompt?: string | null;
  characterIds: number[] | string | null;
};

type Comic = {
  id: number;
  title: string;
  description?: string | null;
  style: string;
  template: string;
  published: boolean;
  coverImageData?: string | null;
  panels: Panel[];
};

type Character = {
  id: number;
  name: string;
  visualStyle?: string;
  personality?: string;
  description?: string;
};

type ApiError = {
  error?: string;
  message?: string;
};

/* -------------------------------------------------------------------------- */
/* API HELPERS                                                                */
/* -------------------------------------------------------------------------- */

async function readApiResponse(res: Response) {
  const text = await res.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.error ||
          data?.message ||
          `Request failed (${res.status})`;

    throw new Error(message);
  }

  return data;
}

function getCharacterIds(panel: Panel): number[] {
  if (Array.isArray(panel.characterIds)) {
    return panel.characterIds
      .map(Number)
      .filter((id) => Number.isFinite(id));
  }

  if (typeof panel.characterIds === "string") {
    try {
      const parsed = JSON.parse(panel.characterIds);

      if (Array.isArray(parsed)) {
        return parsed
          .map(Number)
          .filter((id) => Number.isFinite(id));
      }
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeComic(data: any): Comic | null {
  if (!data) {
    return null;
  }

  const comic = data.comic ?? data;

  if (!comic?.id) {
    return null;
  }

  return {
    ...comic,

    published: Boolean(comic.published),

    panels: Array.isArray(comic.panels)
      ? comic.panels.map((panel: any) => ({
          ...panel,
          order: Number(panel.order ?? 0),
          characterIds: getCharacterIds(panel),
        }))
      : [],
  };
}

/* -------------------------------------------------------------------------- */
/* PANEL CARD                                                                 */
/* -------------------------------------------------------------------------- */

function PanelCard({
  panel,
  index,
  total,
  characters,
  onUpdate,
  onDelete,
  onMove,
  onGenerateImage,
  onGenerateDialogue,
}: {
  panel: Panel;
  index: number;
  total: number;
  characters: Character[];
  onUpdate: (
    id: number,
    data: Partial<Panel>
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onMove: (
    id: number,
    direction: "up" | "down"
  ) => Promise<void>;
  onGenerateImage: (panel: Panel) => Promise<void>;
  onGenerateDialogue: (panel: Panel) => Promise<void>;
}) {
  const [localDialogue, setLocalDialogue] = useState(
    panel.dialogue ?? ""
  );

  const [localCaption, setLocalCaption] = useState(
    panel.caption ?? ""
  );

  const [localPrompt, setLocalPrompt] = useState(
    panel.imagePrompt ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [generatingDlg, setGeneratingDlg] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalDialogue(panel.dialogue ?? "");
  }, [panel.dialogue]);

  useEffect(() => {
    setLocalCaption(panel.caption ?? "");
  }, [panel.caption]);

  useEffect(() => {
    setLocalPrompt(panel.imagePrompt ?? "");
  }, [panel.imagePrompt]);

  const selectedCharacterIds = getCharacterIds(panel);

  /* ---------------------------------------------------------------------- */
  /* SAVE FIELD                                                             */
  /* ---------------------------------------------------------------------- */

  const saveField = async (data: Partial<Panel>) => {
    try {
      setError("");
      setSaving(true);

      await onUpdate(panel.id, data);
    } catch (error: any) {
      setError(
        error?.message || "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* GENERATE IMAGE                                                         */
  /* ---------------------------------------------------------------------- */

  const generateImage = async () => {
    const prompt = localPrompt.trim();

    if (!prompt) {
      setError("Please enter an image prompt first.");
      return;
    }

    try {
      setError("");
      setGeneratingImg(true);

      await saveField({
        imagePrompt: prompt,
      });

      await onGenerateImage({
        ...panel,
        imagePrompt: prompt,
      });
    } catch (error: any) {
      setError(
        error?.message || "Image generation failed."
      );
    } finally {
      setGeneratingImg(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* GENERATE DIALOGUE                                                      */
  /* ---------------------------------------------------------------------- */

  const generateDialogue = async () => {
    try {
      setError("");
      setGeneratingDlg(true);

      await onGenerateDialogue({
        ...panel,
        imagePrompt: localPrompt,
      });
    } catch (error: any) {
      setError(
        error?.message || "Dialogue generation failed."
      );
    } finally {
      setGeneratingDlg(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="bg-cv-card border border-cv-border rounded-xl overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* IMAGE                                                             */}
      {/* ---------------------------------------------------------------- */}

      <div className="h-52 bg-cv-surface relative halftone">
        {panel.imageData ? (
          <img
            src={
              panel.imageData.startsWith("data:")
                ? panel.imageData
                : `data:image/jpeg;base64,${panel.imageData}`
            }
            alt={`Panel ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-cv-muted">
            <BookOpen className="w-10 h-10" />
            <span className="text-sm">
              No image yet
            </span>
          </div>
        )}

        {/* PANEL NUMBER */}

        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          Panel {index + 1}
        </div>

        {/* PANEL CONTROLS */}

        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={() =>
              onMove(panel.id, "up")
            }
            disabled={index === 0}
            className="p-1.5 rounded bg-black/70 text-white hover:bg-cv-accent disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onMove(panel.id, "down")
            }
            disabled={index === total - 1}
            className="p-1.5 rounded bg-black/70 text-white hover:bg-cv-accent disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={async () => {
              const confirmed = window.confirm(
                "Delete this panel?"
              );

              if (!confirmed) {
                return;
              }

              try {
                setError("");
                await onDelete(panel.id);
              } catch (error: any) {
                setError(
                  error?.message ||
                    "Failed to delete panel."
                );
              }
            }}
            className="p-1.5 rounded bg-black/70 text-red-400 hover:bg-red-900"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* PANEL CONTENT                                                     */}
      {/* ---------------------------------------------------------------- */}

      <div className="p-4 space-y-4">
        {/* IMAGE PROMPT */}

        <div>
          <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">
            Image Prompt
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-cv-surface border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent"
              value={localPrompt}
              onChange={(e) =>
                setLocalPrompt(e.target.value)
              }
              onBlur={() => {
                if (
                  localPrompt !==
                  (panel.imagePrompt ?? "")
                ) {
                  saveField({
                    imagePrompt: localPrompt,
                  });
                }
              }}
              placeholder="Describe the scene..."
            />

            <button
              type="button"
              onClick={generateImage}
              disabled={
                generatingImg ||
                !localPrompt.trim()
              }
              className="px-3 rounded-lg bg-cv-accent text-white hover:bg-cv-accent-light disabled:opacity-40"
              title="Generate image"
            >
              {generatingImg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* DIALOGUE */}

        <div>
          <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">
            Dialogue
          </label>

          <div className="flex gap-2">
            <textarea
              className="flex-1 bg-cv-surface border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent resize-none"
              rows={3}
              value={localDialogue}
              onChange={(e) =>
                setLocalDialogue(e.target.value)
              }
              onBlur={() =>
                saveField({
                  dialogue: localDialogue,
                })
              }
              placeholder="Character speech..."
            />

            <button
              type="button"
              onClick={generateDialogue}
              disabled={generatingDlg}
              className="px-3 self-start rounded-lg bg-purple-900/30 text-purple-300 hover:bg-purple-900/60 disabled:opacity-40"
              title="Generate dialogue"
            >
              {generatingDlg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* CAPTION */}

        <div>
          <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">
            Caption
          </label>

          <input
            type="text"
            className="w-full bg-cv-surface border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent"
            value={localCaption}
            onChange={(e) =>
              setLocalCaption(e.target.value)
            }
            onBlur={() =>
              saveField({
                caption: localCaption,
              })
            }
            placeholder="Narration text..."
          />
        </div>

        {/* CHARACTERS */}

        <div>
          <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">
            Characters
          </label>

          <div className="flex flex-wrap gap-1.5">
            {characters.map((character) => {
              const selected =
                selectedCharacterIds.includes(
                  character.id
                );

              return (
                <button
                  type="button"
                  key={character.id}
                  onClick={() => {
                    const ids = selected
                      ? selectedCharacterIds.filter(
                          (id) =>
                            id !== character.id
                        )
                      : [
                          ...selectedCharacterIds,
                          character.id,
                        ];

                    saveField({
                      characterIds: ids,
                    });
                  }}
                  className={`px-2.5 py-1 rounded text-xs border transition ${
                    selected
                      ? "bg-cv-accent/20 border-cv-accent text-cv-accent-light"
                      : "border-cv-border text-cv-muted hover:border-cv-accent"
                  }`}
                >
                  {character.name}
                </button>
              );
            })}

            {characters.length === 0 && (
              <Link href="/characters">
                <span className="text-xs text-cv-muted hover:text-cv-accent cursor-pointer">
                  + Add characters
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* SAVING */}

        {saving && (
          <div className="text-xs text-cv-muted flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="flex gap-2 items-start text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AI STORY MODAL                                                             */
/* -------------------------------------------------------------------------- */

function StoryModal({
  comic,
  characters,
  onApply,
  onClose,
}: {
  comic: Comic;
  characters: Character[];
  onApply: (story: any) => Promise<void>;
  onClose: () => void;
}) {
  const authFetch = useAuthFetch();

  const [prompt, setPrompt] = useState("");
  const [panelCount, setPanelCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* GENERATE STORY                                                         */
  /* ---------------------------------------------------------------------- */

  const generate = async () => {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError("Please enter a story premise.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await authFetch(
        `${apiBase}/ai/generate-story`,
        {
          method: "POST",
          body: JSON.stringify({
            prompt: cleanPrompt,
            style: comic.style,
            panelCount,
            characterNames: characters.map(
              (character) => character.name
            ),
          }),
        }
      );

      const data = await readApiResponse(res);

      if (!data) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      const story =
        data.story ??
        data.data?.story ??
        data;

      if (
        !story?.panels ||
        !Array.isArray(story.panels)
      ) {
        throw new Error(
          "AI returned an invalid story format."
        );
      }

      setResult(story);
    } catch (error: any) {
      setError(
        error?.message ||
          "Story generation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* APPLY STORY                                                            */
  /* ---------------------------------------------------------------------- */

  const applyStory = async () => {
    if (!result) {
      return;
    }

    try {
      setApplying(true);
      setError("");

      await onApply(result);
    } catch (error: any) {
      setError(
        error?.message ||
          "Failed to apply story."
      );
    } finally {
      setApplying(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cv-surface border border-cv-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* HEADER */}

          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-xl font-bold text-cv-text"
              style={{
                fontFamily:
                  "var(--font-cv-display)",
                letterSpacing: "0.04em",
              }}
            >
              AI STORY GENERATOR
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-cv-muted hover:text-cv-text text-xl"
            >
              ×
            </button>
          </div>

          {!result ? (
            /* ------------------------------------------------------------ */
            /* GENERATE FORM                                                */
            /* ------------------------------------------------------------ */

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">
                  Story Premise *
                </label>

                <textarea
                  className="w-full bg-cv-card border border-cv-border rounded-lg px-3 py-2 text-cv-text text-sm focus:outline-none focus:border-cv-accent resize-none"
                  rows={4}
                  value={prompt}
                  onChange={(e) =>
                    setPrompt(e.target.value)
                  }
                  placeholder="A young hero discovers a mysterious robot..."
                />
              </div>

              <div>
                <label className="block text-xs text-cv-muted mb-1.5 uppercase tracking-wide font-medium">
                  Panels: {panelCount}
                </label>

                <input
                  type="range"
                  min={2}
                  max={8}
                  value={panelCount}
                  onChange={(e) =>
                    setPanelCount(
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generate}
                  disabled={
                    loading ||
                    !prompt.trim()
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Story
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 rounded-xl border border-cv-border text-cv-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ------------------------------------------------------------ */
            /* RESULT                                                       */
            /* ------------------------------------------------------------ */

            <div className="space-y-4">
              <div className="bg-cv-card rounded-xl p-4">
                <h3 className="font-bold text-cv-text text-lg">
                  {result.title ||
                    "Generated Story"}
                </h3>

                <p className="text-sm text-cv-muted mt-1">
                  {result.description ||
                    "AI generated comic story"}
                </p>
              </div>

              <div className="space-y-2">
                {result.panels.map(
                  (panel: any, index: number) => (
                    <div
                      key={index}
                      className="bg-cv-card rounded-lg p-3 text-sm"
                    >
                      <p className="text-xs text-cv-muted font-medium mb-1">
                        Panel{" "}
                        {panel.order ??
                          index + 1}
                      </p>

                      {panel.caption && (
                        <p className="text-cv-muted italic text-xs mb-1">
                          {panel.caption}
                        </p>
                      )}

                      {panel.dialogue && (
                        <p className="text-cv-text mb-1">
                          "{panel.dialogue}"
                        </p>
                      )}

                      {panel.imagePrompt && (
                        <p className="text-xs text-purple-300">
                          {panel.imagePrompt}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyStory}
                  disabled={applying}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cv-accent text-white font-semibold disabled:opacity-50"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply to Comic"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                  className="px-4 rounded-xl border border-cv-border text-cv-muted"
                >
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

/* -------------------------------------------------------------------------- */
/* MAIN EDITOR                                                                */
/* -------------------------------------------------------------------------- */

export default function Editor({
  comicId,
}: {
  comicId: number | null;
}) {
  const { isSignedIn } = useAuth();
  const authFetch = useAuthFetch();
  const nav = useNavigate();
  const qc = useQueryClient();

  const [showStoryModal, setShowStoryModal] =
    useState(false);

  const [createdId, setCreatedId] =
    useState<number | null>(null);

  const [pageError, setPageError] = useState("");

  const [newComicForm, setNewComicForm] =
    useState({
      title: "",
      style: "manga",
      template: "4-panel",
    });

  const [localTitle, setLocalTitle] =
    useState("");

  /* ---------------------------------------------------------------------- */
  /* EFFECTIVE COMIC ID                                                     */
  /* ---------------------------------------------------------------------- */

  const effectiveId =
    comicId ?? createdId;

  /* ---------------------------------------------------------------------- */
  /* LOAD COMIC                                                             */
  /* ---------------------------------------------------------------------- */

  const {
    data: comicData,
    isLoading,
    isError,
    error: comicQueryError,
  } = useQuery<Comic | null>({
    queryKey: [
      "comic-edit",
      effectiveId,
    ],

    queryFn: async () => {
      if (!effectiveId) {
        return null;
      }

      const res = await authFetch(
        `${apiBase}/comics/${effectiveId}`
      );

      const data =
        await readApiResponse(res);

      const normalized =
        normalizeComic(data);

      if (!normalized) {
        throw new Error(
          "Invalid comic response from server."
        );
      }

      return normalized;
    },

    enabled:
      !!effectiveId &&
      !!isSignedIn,
  });

  const comic = comicData ?? undefined;

  /* ---------------------------------------------------------------------- */
  /* KEEP TITLE IN SYNC                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (comic) {
      setLocalTitle(comic.title ?? "");
    }
  }, [comic?.id, comic?.title]);

  /* ---------------------------------------------------------------------- */
  /* LOAD CHARACTERS                                                        */
  /* ---------------------------------------------------------------------- */

  const {
    data: characters = [],
    error: charactersError,
  } = useQuery<Character[]>({
    queryKey: ["characters"],

    queryFn: async () => {
      const res = await authFetch(
        `${apiBase}/characters`
      );

      const data =
        await readApiResponse(res);

      if (Array.isArray(data)) {
        return data;
      }

      if (
        Array.isArray(data?.characters)
      ) {
        return data.characters;
      }

      if (
        Array.isArray(data?.data)
      ) {
        return data.data;
      }

      return [];
    },

    enabled: !!isSignedIn,
  });

  /* ---------------------------------------------------------------------- */
  /* CREATE COMIC                                                           */
  /* ---------------------------------------------------------------------- */

  const createComicMutation =
    useMutation({
      mutationFn: async (data: {
        title: string;
        style: string;
        template: string;
      }) => {
        const res = await authFetch(
          `${apiBase}/comics`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        return readApiResponse(res);
      },

      onSuccess: (response) => {
        const createdComic =
          response?.comic ??
          response?.data?.comic ??
          response?.data ??
          response;

        const id = Number(
          createdComic?.id
        );

        if (
          !id ||
          Number.isNaN(id)
        ) {
          console.error(
            "Unexpected create comic response:",
            response
          );

          setPageError(
            "Comic was created, but the server did not return a valid comic ID."
          );

          return;
        }

        setCreatedId(id);
        setPageError("");

        qc.invalidateQueries({
          queryKey: ["my-comics"],
        });

        nav(`/editor/${id}`);
      },

      onError: (error: any) => {
        console.error(
          "CREATE COMIC ERROR:",
          error
        );

        setPageError(
          error?.message ||
            "Could not create comic. Please check the API server."
        );
      },
    });

  /* ---------------------------------------------------------------------- */
  /* UPDATE COMIC                                                           */
  /* ---------------------------------------------------------------------- */

  const updateComicMutation =
    useMutation({
      mutationFn: async (
        data: Partial<Comic>
      ) => {
        if (!effectiveId) {
          throw new Error(
            "No comic selected."
          );
        }

        const res = await authFetch(
          `${apiBase}/comics/${effectiveId}`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );

        return readApiResponse(res);
      },

      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [
            "comic-edit",
            effectiveId,
          ],
        });

        qc.invalidateQueries({
          queryKey: ["my-comics"],
        });
      },

      onError: (error: any) => {
        console.error(
          "UPDATE COMIC ERROR:",
          error
        );

        setPageError(
          error?.message ||
            "Failed to save comic."
        );
      },
    });

  /* ---------------------------------------------------------------------- */
  /* CREATE PANEL                                                           */
  /* ---------------------------------------------------------------------- */

  const createPanelMutation =
    useMutation({
      mutationFn: async (
        data: any
      ) => {
        if (!effectiveId) {
          throw new Error(
            "No comic selected."
          );
        }

        const res = await authFetch(
          `${apiBase}/comics/${effectiveId}/panels`,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );

        return readApiResponse(res);
      },

      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [
            "comic-edit",
            effectiveId,
          ],
        });
      },

      onError: (error: any) => {
        console.error(
          "CREATE PANEL ERROR:",
          error
        );

        setPageError(
          error?.message ||
            "Failed to create panel."
        );
      },
    });

  /* ---------------------------------------------------------------------- */
  /* UPDATE PANEL                                                           */
  /* ---------------------------------------------------------------------- */

  const updatePanelMutation =
    useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: number;
        data: Partial<Panel>;
      }) => {
        const res = await authFetch(
          `${apiBase}/panels/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );

        return readApiResponse(res);
      },

      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [
            "comic-edit",
            effectiveId,
          ],
        });
      },

      onError: (error: any) => {
        console.error(
          "UPDATE PANEL ERROR:",
          error
        );

        setPageError(
          error?.message ||
            "Failed to update panel."
        );
      },
    });

  /* ---------------------------------------------------------------------- */
  /* DELETE PANEL                                                           */
  /* ---------------------------------------------------------------------- */

  const deletePanelMutation =
    useMutation({
      mutationFn: async (
        id: number
      ) => {
        const res = await authFetch(
          `${apiBase}/panels/${id}`,
          {
            method: "DELETE",
          }
        );

        return readApiResponse(res);
      },

      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [
            "comic-edit",
            effectiveId,
          ],
        });
      },

      onError: (error: any) => {
        console.error(
          "DELETE PANEL ERROR:",
          error
        );

        setPageError(
          error?.message ||
            "Failed to delete panel."
        );
      },
    });

  /* ---------------------------------------------------------------------- */
  /* PUBLISH                                                                */
  /* ---------------------------------------------------------------------- */

  const publishMutation =
    useMutation({
      mutationFn: async (
        published: boolean
      ) => {
        if (!effectiveId) {
          throw new Error(
            "No comic selected."
          );
        }

        const res = await authFetch(
          `${apiBase}/comics/${effectiveId}/publish`,
          {
            method: "POST",
            body: JSON.stringify({
              published,
            }),
          }
        );

        return readApiResponse(res);
      },

      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: [
            "comic-edit",
            effectiveId,
          ],
        });

        qc.invalidateQueries({
          queryKey: ["my-comics"],
        });
      },

      onError: (error: any) => {
        console.error(
          "PUBLISH ERROR:",
          error
        );

        setPageError(
          error?.message ||
            "Failed to publish comic."
        );
      },
    });

  /* ---------------------------------------------------------------------- */
  /* AUTH CHECK                                                             */
  /* ---------------------------------------------------------------------- */

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-cv-muted">
          Please sign in to use the editor.
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* NEW COMIC SCREEN                                                       */
  /* ---------------------------------------------------------------------- */

  if (!effectiveId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        {/* HEADER */}

        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() =>
              nav("/dashboard")
            }
            className="text-cv-muted hover:text-cv-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1
            className="text-3xl font-bold text-cv-text"
            style={{
              fontFamily:
                "var(--font-cv-display)",
              letterSpacing: "0.05em",
            }}
          >
            NEW COMIC
          </h1>
        </div>

        <div className="bg-cv-card border border-cv-border rounded-2xl p-6 space-y-6">
          {/* TITLE */}

          <div>
            <label className="block text-xs text-cv-muted mb-2 uppercase tracking-wide font-medium">
              Title *
            </label>

            <input
              type="text"
              className="w-full bg-cv-surface border border-cv-border rounded-xl px-4 py-3 text-cv-text focus:outline-none focus:border-cv-accent"
              value={newComicForm.title}
              onChange={(e) =>
                setNewComicForm(
                  (current) => ({
                    ...current,
                    title: e.target.value,
                  })
                )
              }
              placeholder="My Awesome Comic"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newComicForm.title.trim() &&
                  !createComicMutation.isPending
                ) {
                  createComicMutation.mutate(
                    {
                      ...newComicForm,
                      title:
                        newComicForm.title.trim(),
                    }
                  );
                }
              }}
            />
          </div>

          {/* STYLE */}

          <div>
            <label className="block text-xs text-cv-muted mb-2 uppercase tracking-wide font-medium">
              Art Style
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLES.map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() =>
                    setNewComicForm(
                      (current) => ({
                        ...current,
                        style,
                      })
                    )
                  }
                  className={`py-2.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                    newComicForm.style ===
                    style
                      ? "bg-cv-accent border-cv-accent text-white"
                      : "border-cv-border text-cv-muted hover:border-cv-accent"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* TEMPLATE */}

          <div>
            <label className="block text-xs text-cv-muted mb-2 uppercase tracking-wide font-medium">
              Template
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map(
                (template) => (
                  <button
                    type="button"
                    key={template}
                    onClick={() =>
                      setNewComicForm(
                        (current) => ({
                          ...current,
                          template,
                        })
                      )
                    }
                    className={`py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                      newComicForm.template ===
                      template
                        ? "bg-cv-accent border-cv-accent text-white"
                        : "border-cv-border text-cv-muted hover:border-cv-accent"
                    }`}
                  >
                    {template}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ERROR */}

          {(pageError ||
            createComicMutation.error) && (
            <div className="flex gap-2 items-start text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 shrink-0" />

              <div>
                {pageError ||
                  (
                    createComicMutation.error as ApiError
                  )?.message ||
                  "Could not create comic."}
              </div>
            </div>
          )}

          {/* CREATE */}

          <button
            type="button"
            onClick={() => {
              setPageError("");

              const title =
                newComicForm.title.trim();

              if (!title) {
                setPageError(
                  "Please enter a comic title."
                );
                return;
              }

              createComicMutation.mutate({
                title,
                style:
                  newComicForm.style,
                template:
                  newComicForm.template,
              });
            }}
            disabled={
              !newComicForm.title.trim() ||
              createComicMutation.isPending
            }
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light disabled:opacity-50 transition-colors btn-glow"
          >
            {createComicMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Comic...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create & Open Editor
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* LOADING                                                                */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-cv-accent" />

        <p className="text-cv-muted">
          Loading comic...
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ERROR                                                                  */
  /* ---------------------------------------------------------------------- */

  if (isError || !comic) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />

          <h2 className="text-lg font-semibold text-cv-text mb-2">
            Could not load comic
          </h2>

          <p className="text-sm text-red-400 mb-5">
            {(comicQueryError as any)
              ?.message ||
              "The server could not load this comic."}
          </p>

          <button
            type="button"
            onClick={() =>
              nav("/dashboard")
            }
            className="px-5 py-2.5 rounded-xl bg-cv-accent text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* SORT PANELS                                                            */
  /* ---------------------------------------------------------------------- */

  const panels = [
    ...(comic.panels ?? []),
  ].sort(
    (a, b) =>
      Number(a.order) -
      Number(b.order)
  );

  /* ---------------------------------------------------------------------- */
  /* UPDATE PANEL                                                           */
  /* ---------------------------------------------------------------------- */

  const handleUpdatePanel = async (
    id: number,
    data: Partial<Panel>
  ) => {
    await updatePanelMutation.mutateAsync({
      id,
      data,
    });
  };

  /* ---------------------------------------------------------------------- */
  /* DELETE PANEL                                                           */
  /* ---------------------------------------------------------------------- */

  const handleDeletePanel = async (
    id: number
  ) => {
    await deletePanelMutation.mutateAsync(
      id
    );
  };

  /* ---------------------------------------------------------------------- */
  /* MOVE PANEL                                                             */
  /* ---------------------------------------------------------------------- */

  const handleMovePanel = async (
    id: number,
    direction: "up" | "down"
  ) => {
    const index =
      panels.findIndex(
        (panel) => panel.id === id
      );

    if (index === -1) {
      return;
    }

    const swapIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      swapIndex < 0 ||
      swapIndex >= panels.length
    ) {
      return;
    }

    const current =
      panels[index];

    const swap =
      panels[swapIndex];

    try {
      setPageError("");

      /*
       * Use temporary order to prevent
       * duplicate order values during swap.
       */
      const temporaryOrder =
        -Date.now();

      await updatePanelMutation.mutateAsync(
        {
          id: current.id,
          data: {
            order: temporaryOrder,
          },
        }
      );

      await updatePanelMutation.mutateAsync(
        {
          id: swap.id,
          data: {
            order: current.order,
          },
        }
      );

      await updatePanelMutation.mutateAsync(
        {
          id: current.id,
          data: {
            order: swap.order,
          },
        }
      );

      await qc.invalidateQueries({
        queryKey: [
          "comic-edit",
          effectiveId,
        ],
      });
    } catch (error: any) {
      setPageError(
        error?.message ||
          "Failed to move panel."
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* GENERATE IMAGE                                                         */
  /* ---------------------------------------------------------------------- */

  const handleGenerateImage = async (
    panel: Panel
  ) => {
    const cleanPrompt =
      panel.imagePrompt?.trim();

    if (!cleanPrompt) {
      throw new Error(
        "Please enter an image prompt."
      );
    }

    const selectedIds =
      getCharacterIds(panel);

    const selectedCharacters =
      characters.filter(
        (character) =>
          selectedIds.includes(
            character.id
          )
      );

    const characterContext =
      selectedCharacters.length > 0
        ? ` Characters: ${selectedCharacters
            .map(
              (character) =>
                character.name
            )
            .join(", ")}.`
        : "";

    const prompt =
      `${cleanPrompt}.` +
      characterContext;

    console.log(
      "Generating image:",
      {
        prompt,
        style: comic.style,
        panelDescription:
          panel.caption ||
          cleanPrompt,
      }
    );

    const res = await authFetch(
      `${apiBase}/ai/generate-image`,
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
          style: comic.style,
          panelDescription:
            panel.caption ||
            cleanPrompt,
        }),
      }
    );

    const data =
      await readApiResponse(res);

    const imageData =
      data?.imageData ??
      data?.data?.imageData ??
      data?.image ??
      data?.data?.image;

    if (!imageData) {
      throw new Error(
        "Image service returned no image data."
      );
    }

    await updatePanelMutation.mutateAsync(
      {
        id: panel.id,
        data: {
          imageData,
        },
      }
    );

    await qc.invalidateQueries({
      queryKey: [
        "comic-edit",
        effectiveId,
      ],
    });
  };

  /* ---------------------------------------------------------------------- */
  /* GENERATE DIALOGUE                                                      */
  /* ---------------------------------------------------------------------- */

  const handleGenerateDialogue =
    async (panel: Panel) => {
      const selectedIds =
        getCharacterIds(panel);

      const selectedCharacters =
        characters.filter(
          (character) =>
            selectedIds.includes(
              character.id
            )
        );

      const res = await authFetch(
        `${apiBase}/ai/generate-dialogue`,
        {
          method: "POST",
          body: JSON.stringify({
            panelDescription:
              panel.imagePrompt ||
              panel.caption ||
              "comic scene",

            characterNames:
              selectedCharacters.map(
                (character) =>
                  character.name
              ),

            style: comic.style,
          }),
        }
      );

      const data =
        await readApiResponse(res);

      const dialogue =
        data?.dialogue ??
        data?.data?.dialogue ??
        "";

      const caption =
        data?.caption ??
        data?.data?.caption ??
        "";

      await updatePanelMutation.mutateAsync(
        {
          id: panel.id,
          data: {
            dialogue,
            caption,
          },
        }
      );

      await qc.invalidateQueries({
        queryKey: [
          "comic-edit",
          effectiveId,
        ],
      });
    };

  /* ---------------------------------------------------------------------- */
  /* APPLY AI STORY                                                         */
  /* ---------------------------------------------------------------------- */

  const handleApplyStory =
    async (story: any) => {
      if (
        !story?.panels ||
        !Array.isArray(story.panels)
      ) {
        throw new Error(
          "AI returned an invalid story."
        );
      }

      const cleanTitle =
        String(
          story.title ||
            comic.title ||
            ""
        ).trim();

      const description =
        String(
          story.description || ""
        );

      /* Update comic metadata */

      await updateComicMutation.mutateAsync(
        {
          title:
            cleanTitle ||
            comic.title,
          description,
        }
      );

      /*
       * Create generated panels.
       *
       * Continue from the current number of panels
       * so existing panels don't receive duplicate
       * order values.
       */
      const startingOrder =
        panels.length;

      for (
        let index = 0;
        index < story.panels.length;
        index++
      ) {
        const panel =
          story.panels[index];

        await createPanelMutation.mutateAsync(
          {
            order:
              startingOrder +
              index +
              1,

            caption:
              panel.caption ?? "",

            dialogue:
              panel.dialogue ?? "",

            imagePrompt:
              panel.imagePrompt ?? "",

            characterIds: [],
          }
        );
      }

      setShowStoryModal(false);

      await qc.invalidateQueries({
        queryKey: [
          "comic-edit",
          effectiveId,
        ],
      });

      setPageError("");
    };

  /* ---------------------------------------------------------------------- */
  /* SAVE TITLE                                                             */
  /* ---------------------------------------------------------------------- */

  const saveTitle = async () => {
    const title =
      localTitle.trim();

    if (!title) {
      setLocalTitle(comic.title);
      return;
    }

    if (title === comic.title) {
      return;
    }

    try {
      setPageError("");

      await updateComicMutation.mutateAsync(
        {
          title,
        }
      );
    } catch {
      setLocalTitle(comic.title);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* ADD PANEL                                                              */
  /* ---------------------------------------------------------------------- */

  const addPanel = () => {
    createPanelMutation.mutate({
      order:
        panels.length + 1,
      characterIds: [],
      dialogue: "",
      caption: "",
      imagePrompt: "",
    });
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* PAGE ERROR */}

      {pageError && (
        <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />

          <div className="flex-1">
            {pageError}
          </div>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
            className="text-red-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* CHARACTER WARNING */}

      {charactersError && (
        <div className="mb-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-sm text-yellow-300">
          Characters could not be loaded.
          You can still edit the comic.
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* HEADER                                                           */}
      {/* ---------------------------------------------------------------- */}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            nav("/dashboard")
          }
          className="text-cv-muted hover:text-cv-text transition-colors"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* TITLE */}

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            className="bg-transparent text-2xl font-bold text-cv-text focus:outline-none border-b border-transparent focus:border-cv-accent pb-1 w-full"
            style={{
              fontFamily:
                "var(--font-cv-display)",
              letterSpacing: "0.04em",
            }}
            value={localTitle}
            onChange={(e) =>
              setLocalTitle(
                e.target.value
              )
            }
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }

              if (e.key === "Escape") {
                setLocalTitle(
                  comic.title
                );

                e.currentTarget.blur();
              }
            }}
          />

          <div className="flex items-center gap-2 mt-1">
            <span className="style-tag">
              {comic.style}
            </span>

            <span className="text-xs text-cv-muted">
              {comic.template}
            </span>

            {updateComicMutation.isPending && (
              <span className="text-xs text-cv-muted flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving
              </span>
            )}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI STORY */}

          <button
            type="button"
            onClick={() =>
              setShowStoryModal(true)
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cv-accent/40 text-cv-accent-light text-sm hover:bg-cv-accent/10"
          >
            <Sparkles className="w-4 h-4" />
            AI Story
          </button>

          {/* ADD PANEL */}

          <button
            type="button"
            onClick={addPanel}
            disabled={
              createPanelMutation.isPending
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cv-surface border border-cv-border text-cv-text text-sm hover:bg-cv-card disabled:opacity-50"
          >
            {createPanelMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}

            Panel
          </button>

          {/* PUBLISH */}

          <button
            type="button"
            onClick={() =>
              publishMutation.mutate(
                !comic.published
              )
            }
            disabled={
              publishMutation.isPending
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
              comic.published
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-cv-surface border border-cv-border text-cv-muted hover:text-cv-text"
            }`}
          >
            {publishMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : comic.published ? (
              <>
                <Globe className="w-4 h-4" />
                Published
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Draft
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* PANELS                                                           */}
      {/* ---------------------------------------------------------------- */}

      {panels.length === 0 ? (
        <div className="bg-cv-card border border-cv-border border-dashed rounded-2xl py-20 text-center">
          <BookOpen className="w-12 h-12 text-cv-muted mx-auto mb-3" />

          <p className="text-cv-muted mb-5">
            No panels yet. Generate a story
            or add a panel manually.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() =>
                setShowStoryModal(true)
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cv-accent text-white font-semibold hover:bg-cv-accent-light"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>

            <button
              type="button"
              onClick={addPanel}
              disabled={
                createPanelMutation.isPending
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cv-border text-cv-text disabled:opacity-50"
            >
              {createPanelMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}

              Add Panel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {panels.map(
            (panel, index) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                index={index}
                total={panels.length}
                characters={
                  characters
                }
                onUpdate={
                  handleUpdatePanel
                }
                onDelete={
                  handleDeletePanel
                }
                onMove={
                  handleMovePanel
                }
                onGenerateImage={
                  handleGenerateImage
                }
                onGenerateDialogue={
                  handleGenerateDialogue
                }
              />
            )
          )}

          {/* ADD PANEL CARD */}

          <button
            type="button"
            onClick={addPanel}
            disabled={
              createPanelMutation.isPending
            }
            className="bg-cv-card border border-cv-border border-dashed rounded-xl min-h-[250px] flex flex-col items-center justify-center gap-2 text-cv-muted hover:text-cv-text hover:border-cv-accent/50 transition-colors disabled:opacity-50"
          >
            {createPanelMutation.isPending ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Plus className="w-8 h-8" />
            )}

            <span className="text-sm">
              Add Panel
            </span>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* AI STORY MODAL                                                   */}
      {/* ---------------------------------------------------------------- */}

      {showStoryModal && (
        <StoryModal
          comic={comic}
          characters={characters}
          onApply={
            handleApplyStory
          }
          onClose={() =>
            setShowStoryModal(false)
          }
        />
      )}
    </div>
  );
}