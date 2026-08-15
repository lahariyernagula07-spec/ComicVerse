import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from "../app";

const router = Router();

/* =========================================================
   ENVIRONMENT VARIABLES
========================================================= */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not configured on the server."
  );
}

if (!PIXAZO_API_KEY) {
  console.warn(
    "WARNING: PIXAZO_API_KEY is not configured on the server."
  );
}

/* =========================================================
   GEMINI CLIENT
========================================================= */

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    })
  : null;

/* =========================================================
   GEMINI TEXT MODELS
========================================================= */

const TEXT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

/* =========================================================
   COMIC STYLES
========================================================= */

const STYLE_TAGS: Record<string, string> = {
  manga:
    "manga comic aesthetic, clean ink lines, bold outlines, expressive characters, detailed backgrounds",

  marvel:
    "superhero comic aesthetic, bold colors, dynamic composition, dramatic action, powerful poses",

  anime:
    "anime aesthetic, vibrant colors, expressive eyes, detailed characters, cinematic lighting",

  cartoon:
    "western cartoon aesthetic, bright colors, bold outlines, expressive characters, playful composition",

  pixel:
    "retro 16-bit pixel art aesthetic, crisp pixels, limited color palette, detailed sprites",

  webtoon:
    "Korean webtoon manhwa aesthetic, clean line art, soft shading, expressive characters, polished backgrounds",

  disney:
    "classic family-friendly animated feature aesthetic, colorful 2D animation, expressive rounded character design, warm lighting, polished storybook backgrounds, whimsical cinematic composition",

  noir:
    "dark noir comic aesthetic, high contrast, dramatic shadows, monochrome atmosphere, cinematic composition",
};

/* =========================================================
   IMAGE QUALITY
========================================================= */

const QUALITY_SUFFIX =
  "sharp focus, clean composition, professional comic illustration, detailed characters, cinematic lighting";

/* =========================================================
   NORMALIZE STYLE
========================================================= */

function normalizeStyle(style: unknown): string {
  if (typeof style !== "string") {
    return "";
  }

  return style.trim().toLowerCase();
}

/* =========================================================
   GET STYLE TAG
========================================================= */

function getStyleTag(style: unknown): string {
  const normalizedStyle = normalizeStyle(style);

  return (
    STYLE_TAGS[normalizedStyle] ??
    (typeof style === "string" && style.trim()
      ? style.trim()
      : "professional comic art")
  );
}

/* =========================================================
   JSON PARSER
   Handles:
   - normal JSON
   - markdown JSON
   - extra text around JSON
========================================================= */

function parseAIJson(text: string): any {
  if (!text || !text.trim()) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleaned = text.trim();

  /* Remove markdown code fences */

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  /* First attempt */

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue.
  }

  /* Find object */

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (
    objectStart !== -1 &&
    objectEnd !== -1 &&
    objectEnd > objectStart
  ) {
    const objectText = cleaned.slice(
      objectStart,
      objectEnd + 1
    );

    try {
      return JSON.parse(objectText);
    } catch {
      // Continue.
    }
  }

  /* Find array */

  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");

  if (
    arrayStart !== -1 &&
    arrayEnd !== -1 &&
    arrayEnd > arrayStart
  ) {
    const arrayText = cleaned.slice(
      arrayStart,
      arrayEnd + 1
    );

    try {
      return JSON.parse(arrayText);
    } catch {
      // Continue.
    }
  }

  console.error(
    "Gemini returned invalid JSON:"
  );

  console.error(cleaned);

  throw new Error(
    "Gemini returned invalid JSON. Please try again."
  );
}

/* =========================================================
   GEMINI TEXT GENERATION
========================================================= */

async function generateText(
  contents: any,
  config: any
): Promise<string> {
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server."
    );
  }

  let lastError: any = null;

  for (const model of TEXT_MODELS) {
    try {
      console.log(
        `Trying Gemini model: ${model}`
      );

      const response =
        await ai.models.generateContent({
          model,
          contents,
          config,
        });

      const text = response.text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log(
        `Gemini ${model} succeeded.`
      );

      return text;
    } catch (error: any) {
      lastError = error;

      const message = String(
        error?.message ?? ""
      );

      console.error(
        `Gemini ${model} error:`,
        message
      );

      const retryable =
        message.includes("429") ||
        message.includes("503") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.toLowerCase().includes("quota") ||
        message
          .toLowerCase()
          .includes("temporarily unavailable");

      if (retryable) {
        continue;
      }

      throw error;
    }
  }

  throw (
    lastError ??
    new Error(
      "All Gemini models failed."
    )
  );
}

/* =========================================================
   GENERATE STORY
========================================================= */

router.post(
  "/generate-story",
  requireAuth,
  async (req, res) => {
    try {
      const {
        prompt,
        style,
        panelCount = 4,
        characterNames = [],
      } = req.body;

      /* Validation */

      if (
        typeof prompt !== "string" ||
        !prompt.trim()
      ) {
        return res.status(400).json({
          error:
            "Story prompt is required.",
        });
      }

      if (
        typeof style !== "string" ||
        !style.trim()
      ) {
        return res.status(400).json({
          error:
            "Comic style is required.",
        });
      }

      const safePanelCount = Math.max(
        1,
        Math.min(
          Number(panelCount) || 4,
          12
        )
      );

      const characters =
        Array.isArray(characterNames) &&
        characterNames.length > 0
          ? `Characters: ${characterNames
              .map(String)
              .join(", ")}.`
          : "No named characters were provided.";

      const styleTag =
        getStyleTag(style);

      /* Prompt */

      const fullPrompt = `
You are a professional comic writer.

Create exactly ${safePanelCount} panels for a comic.

${characters}

SELECTED ART STYLE:
${styleTag}

STORY PREMISE:
"${prompt.trim()}"

Create a coherent comic story.

Every panel must contain:

1. order
2. caption
3. dialogue
4. imagePrompt

The imagePrompt must describe:

- characters present
- character appearance
- character actions
- facial expressions
- location
- environment
- lighting
- camera/composition
- selected art style

The imagePrompt will be sent directly to an image generation model.

IMPORTANT:

Return ONLY valid JSON.

Do NOT return Markdown.
Do NOT use code fences.
Do NOT add explanations.
Do NOT add comments.
Do NOT add text before JSON.
Do NOT add text after JSON.

All strings must be valid JSON strings.

Return EXACTLY this structure:

{
  "title": "Comic title",
  "description": "Short comic description",
  "panels": [
    {
      "order": 1,
      "caption": "Short narration",
      "dialogue": "Short natural dialogue",
      "imagePrompt": "Detailed visual description of the panel"
    }
  ]
}

Return exactly ${safePanelCount} panels.
`;

      /* Generate */

      const content =
        await generateText(
          [
            {
              role: "user",
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          {
            responseMimeType:
              "application/json",

            maxOutputTokens: 8192,
          }
        );

      /* Parse */

      const result =
        parseAIJson(content);

      /* Validate object */

      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        throw new Error(
          "Gemini returned an invalid story object."
        );
      }

      /* Validate panels */

      if (
        !Array.isArray(
          result.panels
        )
      ) {
        console.error(
          "Unexpected Gemini story response:",
          result
        );

        throw new Error(
          "Gemini story does not contain a panels array. Please try again."
        );
      }

      /* Normalize panels */

      result.panels =
        result.panels
          .slice(0, safePanelCount)
          .map(
            (
              panel: any,
              index: number
            ) => ({
              order:
                Number(
                  panel?.order
                ) || index + 1,

              caption:
                typeof panel?.caption ===
                "string"
                  ? panel.caption
                  : "",

              dialogue:
                typeof panel?.dialogue ===
                "string"
                  ? panel.dialogue
                  : "",

              imagePrompt:
                typeof panel?.imagePrompt ===
                "string" &&
                panel.imagePrompt.trim()
                  ? panel.imagePrompt
                  : `${styleTag}, professional comic panel scene`,
            })
          );

      /* Ensure requested panel count */

      while (
        result.panels.length <
        safePanelCount
      ) {
        const index =
          result.panels.length + 1;

        result.panels.push({
          order: index,
          caption: "",
          dialogue: "",
          imagePrompt: `${styleTag}, professional comic panel scene`,
        });
      }

      /* Normalize title */

      if (
        typeof result.title !==
        "string"
      ) {
        result.title =
          "Untitled Comic";
      }

      /* Normalize description */

      if (
        typeof result.description !==
        "string"
      ) {
        result.description =
          "AI-generated comic story.";
      }

      return res.json(result);
    } catch (error: any) {
      console.error(
        "generate-story error:",
        error
      );

      return res.status(500).json({
        error:
          error?.message ??
          "AI story generation failed.",
      });
    }
  }
);

/* =========================================================
   GENERATE DIALOGUE
========================================================= */

router.post(
  "/generate-dialogue",
  requireAuth,
  async (req, res) => {
    try {
      const {
        panelDescription,
        characterNames = [],
        style,
      } = req.body;

      if (
        typeof panelDescription !==
          "string" ||
        !panelDescription.trim()
      ) {
        return res.status(400).json({
          error:
            "panelDescription is required.",
        });
      }

      if (
        typeof style !== "string" ||
        !style.trim()
      ) {
        return res.status(400).json({
          error:
            "style is required.",
        });
      }

      const characters =
        Array.isArray(characterNames) &&
        characterNames.length > 0
          ? `Characters: ${characterNames
              .map(String)
              .join(", ")}`
          : "No named characters.";

      const styleTag =
        getStyleTag(style);

      const prompt = `
Write short natural dialogue for a comic panel.

ART STYLE:
${styleTag}

SCENE:
${panelDescription.trim()}

${characters}

The dialogue should match the characters, emotions and scene.

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not add explanations.

Use exactly this structure:

{
  "dialogue": "Short natural dialogue",
  "caption": "Short narration or empty string"
}
`;

      const content =
        await generateText(
          [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          {
            responseMimeType:
              "application/json",

            maxOutputTokens: 2048,
          }
        );

      const result =
        parseAIJson(content);

      return res.json({
        dialogue:
          typeof result?.dialogue ===
          "string"
            ? result.dialogue
            : "",

        caption:
          typeof result?.caption ===
          "string"
            ? result.caption
            : "",
      });
    } catch (error: any) {
      console.error(
        "generate-dialogue error:",
        error
      );

      return res.status(500).json({
        error:
          error?.message ??
          "Dialogue generation failed.",
      });
    }
  }
);

/* =========================================================
   GENERATE IMAGE - PIXAZO FLUX
========================================================= */

router.post(
  "/generate-image",
  requireAuth,
  async (req, res) => {
    try {
      const {
        prompt,
        style,
        panelDescription,
      } = req.body;

      /* -----------------------------------------------------
         VALIDATION
      ----------------------------------------------------- */

      if (
        typeof prompt !== "string" ||
        !prompt.trim()
      ) {
        return res.status(400).json({
          error:
            "Image prompt is required.",
        });
      }

      if (
        typeof style !== "string" ||
        !style.trim()
      ) {
        return res.status(400).json({
          error:
            "Image style is required.",
        });
      }

      if (!PIXAZO_API_KEY) {
        return res.status(500).json({
          error:
            "PIXAZO_API_KEY is not configured on the server.",
        });
      }

      /* -----------------------------------------------------
         NORMALIZE STYLE
      ----------------------------------------------------- */

      const normalizedStyle =
        normalizeStyle(style);

      const styleTag =
        getStyleTag(style);

      console.log(
        "========================================"
      );

      console.log(
        "PIXAZO IMAGE GENERATION"
      );

      console.log(
        "Requested style:",
        style
      );

      console.log(
        "Normalized style:",
        normalizedStyle
      );

      console.log(
        "========================================"
      );

      /* -----------------------------------------------------
         SCENE
      ----------------------------------------------------- */

      const sceneParts: string[] = [];

      if (
        typeof panelDescription ===
          "string" &&
        panelDescription.trim()
      ) {
        sceneParts.push(
          panelDescription.trim()
        );
      }

      if (prompt.trim()) {
        sceneParts.push(
          prompt.trim()
        );
      }

      const scene =
        sceneParts.join(". ");

      /* -----------------------------------------------------
         SPECIAL STYLE INSTRUCTIONS
      ----------------------------------------------------- */

      let styleInstruction = "";

      switch (normalizedStyle) {
        case "manga":
          styleInstruction =
            "Use Japanese manga-inspired visual language, clean black ink lines, expressive faces and strong panel-like composition.";
          break;

        case "marvel":
          styleInstruction =
            "Use dynamic superhero comic visual language, dramatic poses, powerful anatomy, bold colors and cinematic action composition.";
          break;

        case "anime":
          styleInstruction =
            "Use anime-inspired character design, expressive eyes, clean linework, vibrant colors and cinematic lighting.";
          break;

        case "cartoon":
          styleInstruction =
            "Use colorful western cartoon visual language, bold outlines, simplified expressive characters and playful composition.";
          break;

        case "pixel":
          styleInstruction =
            "Use authentic retro 16-bit pixel art, visible crisp pixels, sprite-like characters and a limited color palette.";
          break;

        case "webtoon":
          styleInstruction =
            "Use polished Korean webtoon/manhwa visual language, clean linework, soft shading and expressive characters.";
          break;

        case "disney":
          styleInstruction =
            "Use a classic family-friendly animated feature look with colorful 2D animation, rounded expressive character designs, warm lighting and whimsical storybook environments.";
          break;

        case "noir":
          styleInstruction =
            "Use dark noir comic visual language, strong shadows, high contrast, dramatic lighting and a cinematic monochrome atmosphere.";
          break;

        default:
          styleInstruction =
            "Use a polished professional comic illustration style.";
          break;
      }

      /* -----------------------------------------------------
         FINAL IMAGE PROMPT
      ----------------------------------------------------- */

      const fullPrompt = `
Create one professional comic panel illustration.

SCENE:
${scene}

STYLE:
${styleTag}

STYLE-SPECIFIC DIRECTION:
${styleInstruction}

QUALITY:
${QUALITY_SUFFIX}

COMPOSITION REQUIREMENTS:

- clear characters
- clear character faces
- clear character actions
- expressive emotions
- detailed environment
- strong foreground and background separation
- cinematic composition
- appealing lighting
- professional comic artwork
- coherent anatomy
- consistent visual style
- detailed but readable background

IMPORTANT:

- no speech bubbles
- no captions
- no written dialogue
- no random text
- no letters
- no logos
- no watermark
- no UI elements
`;

      console.log(
        "Sending request to Pixazo..."
      );

      /* -----------------------------------------------------
         PIXAZO API REQUEST
      ----------------------------------------------------- */

      const pixazoResponse =
        await fetch(
          "https://gateway.pixazo.ai/flux-1-schnell/v1/getData",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Cache-Control":
                "no-cache",

              "Ocp-Apim-Subscription-Key":
                PIXAZO_API_KEY,
            },

            body: JSON.stringify({
              prompt:
                fullPrompt,

              num_steps: 4,

              seed:
                Math.floor(
                  Math.random() *
                    2147483647
                ),

              width: 1024,

              height: 768,
            }),
          }
        );

      /* -----------------------------------------------------
         READ RESPONSE AS TEXT FIRST
         This prevents JSON parsing crashes when Pixazo
         returns an unexpected response.
      ----------------------------------------------------- */

      const responseText =
        await pixazoResponse.text();

      let pixazoResult: any = null;

      try {
        pixazoResult =
          JSON.parse(
            responseText
          );
      } catch {
        pixazoResult = null;
      }

      console.log(
        "Pixazo HTTP status:",
        pixazoResponse.status
      );

      /* -----------------------------------------------------
         API ERROR
      ----------------------------------------------------- */

      if (!pixazoResponse.ok) {
        console.error(
          "Pixazo API error response:",
          responseText
        );

        const errorMessage =
          pixazoResult &&
          typeof pixazoResult ===
            "object"
            ? String(
                pixazoResult.message ??
                  pixazoResult.error ??
                  pixazoResult.detail ??
                  pixazoResult.errors ??
                  "Unknown Pixazo error"
              )
            : responseText ||
              "Unknown Pixazo error";

        return res.status(502).json({
          error:
            `Pixazo image generation failed (${pixazoResponse.status}): ${errorMessage}`,
        });
      }

      /* -----------------------------------------------------
         EXTRACT OUTPUT URL
      ----------------------------------------------------- */

      let imageUrl: string | null =
        null;

      if (
        pixazoResult &&
        typeof pixazoResult ===
          "object"
      ) {
        if (
          typeof pixazoResult.output ===
          "string"
        ) {
          imageUrl =
            pixazoResult.output;
        } else if (
          typeof pixazoResult.image_url ===
          "string"
        ) {
          imageUrl =
            pixazoResult.image_url;
        } else if (
          typeof pixazoResult.url ===
          "string"
        ) {
          imageUrl =
            pixazoResult.url;
        } else if (
          pixazoResult.data &&
          typeof pixazoResult.data ===
            "object"
        ) {
          if (
            typeof pixazoResult.data
              .output ===
            "string"
          ) {
            imageUrl =
              pixazoResult.data.output;
          } else if (
            typeof pixazoResult.data
              .image_url ===
            "string"
          ) {
            imageUrl =
              pixazoResult.data.image_url;
          } else if (
            typeof pixazoResult.data
              .url ===
            "string"
          ) {
            imageUrl =
              pixazoResult.data.url;
          }
        }
      }

      /* -----------------------------------------------------
         CHECK URL
      ----------------------------------------------------- */

      if (!imageUrl) {
        console.error(
          "Unexpected Pixazo response:"
        );

        console.error(
          responseText
        );

        return res.status(502).json({
          error:
            "Pixazo did not return a valid image URL.",
        });
      }

      console.log(
        "Pixazo image URL received:"
      );

      console.log(
        imageUrl
      );

      /* -----------------------------------------------------
         DOWNLOAD GENERATED IMAGE
      ----------------------------------------------------- */

      const imageResponse =
        await fetch(imageUrl);

      if (!imageResponse.ok) {
        throw new Error(
          `Unable to download Pixazo image. HTTP ${imageResponse.status}`
        );
      }

      const imageArrayBuffer =
        await imageResponse.arrayBuffer();

      const imageBuffer =
        Buffer.from(
          imageArrayBuffer
        );

      if (
        imageBuffer.length === 0
      ) {
        throw new Error(
          "Pixazo returned an empty image."
        );
      }

      /* -----------------------------------------------------
         CONTENT TYPE
      ----------------------------------------------------- */

      let contentType =
        imageResponse.headers.get(
          "content-type"
        ) || "image/png";

      /*
       * Some image hosts can return an unexpected
       * content type. Since Pixazo Flux currently
       * returns PNG images in your test, default
       * safely to PNG.
       */

      if (
        !contentType.startsWith(
          "image/"
        )
      ) {
        contentType =
          "image/png";
      }

      /* -----------------------------------------------------
         BASE64
      ----------------------------------------------------- */

      const imageData =
        imageBuffer.toString(
          "base64"
        );

      console.log(
        "========================================"
      );

      console.log(
        "PIXAZO IMAGE GENERATION SUCCESS"
      );

      console.log(
        "Style:",
        normalizedStyle
      );

      console.log(
        "Image size:",
        imageBuffer.length,
        "bytes"
      );

      console.log(
        "Content type:",
        contentType
      );

      console.log(
        "========================================"
      );

      /* -----------------------------------------------------
         RESPONSE TO FRONTEND
      ----------------------------------------------------- */

      return res.json({
        imageData,
        contentType,
      });
    } catch (error: any) {
      console.error(
        "========================================"
      );

      console.error(
        "generate-image error:"
      );

      console.error(
        error
      );

      console.error(
        "========================================"
      );

      return res.status(500).json({
        error:
          error?.message ??
          "Pixazo image generation failed.",
      });
    }
  }
);

/* =========================================================
   EXPORT ROUTER
========================================================= */

export default router;