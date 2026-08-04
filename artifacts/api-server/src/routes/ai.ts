import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from "../app";

const router = Router();

if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models tried in order on 429/503 — all verified working with this key
const TEXT_MODELS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];
async function generateTextWithFallback(
  ai: GoogleGenAI,
  contents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"],
  config: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["config"]
): Promise<string> {
  let lastError: any;
  for (const model of TEXT_MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents, config });
      const text = response.text;
      if (!text) throw new Error("Empty response");
      return text;
    } catch (err: any) {
      const code = err?.message?.match(/"code":(\d+)/)?.[1];
      // Only fall through on retriable errors; throw immediately otherwise
      if (code === "429" || code === "503") {
        console.warn(`Model ${model} returned ${code}, trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("All models unavailable");
}

// Short style tags — kept concise so scene content dominates the prompt
const STYLE_TAGS: Record<string, string> = {
  manga:   "manga style, clean ink lines, bold outlines",
  marvel:  "Marvel comic book style, bold colors, dynamic composition",
  anime:   "anime style, vibrant colors, expressive eyes",
  cartoon: "western cartoon style, bright colors, bold outlines",
  pixel:   "pixel art style, retro 16-bit, clear sprites",
  webtoon: "webtoon manhwa style, soft shading, clean lines",
  disney:  "Disney animation style, warm colors, expressive faces",
  noir:    "noir comic style, high contrast, dramatic shadows",
};

const QUALITY_SUFFIX = "sharp focus, clean composition, professional illustration";
const NEGATIVE_PROMPT = "blurry, low quality, distorted face, bad anatomy, deformed, extra limbs, watermark, text overlay, cluttered background, confusing composition, low resolution";

router.post("/generate-story", requireAuth, async (req, res) => {
  try {
    const { prompt, style, panelCount = 4, characterNames = [] } = req.body;
    if (!prompt || !style) { res.status(400).json({ error: "prompt and style required" }); return; }
    const styleTag = STYLE_TAGS[style] ?? style;
    const charList = characterNames.length > 0 ? `Characters: ${characterNames.join(", ")}.` : "";
    const fullPrompt = `You are a creative comic book writer. Generate engaging comic strip stories in JSON format.

Create a ${panelCount}-panel comic story. ${charList}
Story premise: "${prompt}"

For each panel's imagePrompt, write a SHORT clear scene description (1-2 sentences max) in this order:
1. WHO is in the scene and WHAT they are doing (include facial expression, e.g. "smiling warmly", "eyes wide in shock")
2. WHERE the scene takes place (simple background)
Keep it simple and visual. Do NOT include style tags in imagePrompt — those are added automatically.

Return ONLY valid JSON in this exact format:
{
  "title": "Comic title",
  "description": "One sentence description",
  "panels": [
    {
      "order": 1,
      "caption": "Scene setting or narration text",
      "dialogue": "Character dialogue or speech",
      "imagePrompt": "A young hero with a determined grin raises her fist in front of a glowing city skyline at night."
    }
  ]
}`;

    const content = await generateTextWithFallback(
      ai,
      [{ role: "user", parts: [{ text: fullPrompt }] }],
      { responseMimeType: "application/json", maxOutputTokens: 8192 }
    );
    res.json(JSON.parse(content));
  } catch (err: any) {
    const code = err?.message?.match(/"code":(\d+)/)?.[1];
    console.error("generate-story error:", err?.message);
    res.status(500).json({
      error: code === "429"
        ? "AI quota exceeded. Please wait a moment and try again."
        : "AI generation failed. Please try again.",
    });
  }
});

router.post("/generate-dialogue", requireAuth, async (req, res) => {
  try {
    const { panelDescription, characterNames = [], style, context } = req.body;
    if (!panelDescription || !style) { res.status(400).json({ error: "panelDescription and style required" }); return; }
    const styleTag = STYLE_TAGS[style] ?? style;
    const charList = characterNames.length > 0 ? `Characters in this panel: ${characterNames.join(", ")}.` : "";
    const fullPrompt = `Write dialogue and caption for a comic panel in ${styleTag} style.
Panel description: "${panelDescription}"
${charList}
${context ? `Story context: "${context}"` : ""}

Return ONLY valid JSON:
{
  "dialogue": "The speech/dialogue for the characters",
  "caption": "Narration or caption text (can be empty string)"
}`;

    const content = await generateTextWithFallback(
      ai,
      [{ role: "user", parts: [{ text: fullPrompt }] }],
      { responseMimeType: "application/json", maxOutputTokens: 8192 }
    );
    res.json(JSON.parse(content));
  } catch (err: any) {
    const code = err?.message?.match(/"code":(\d+)/)?.[1];
    console.error("generate-dialogue error:", err?.message);
    res.status(500).json({
      error: code === "429"
        ? "AI quota exceeded. Please wait a moment and try again."
        : "AI generation failed. Please try again.",
    });
  }
});

router.post("/generate-image", requireAuth, async (req, res) => {
  try {
    const { prompt, style, panelDescription } = req.body;

    if (!prompt || !style) {
      res.status(400).json({ error: "prompt and style required" });
      return;
    }

    const styleTag = STYLE_TAGS[style] ?? style;

    const fullPrompt = `
Create a comic panel illustration.

Scene:
${panelDescription || prompt}

Style:
${styleTag}

Requirements:
- professional comic artwork
- clear characters
- expressive faces
- detailed background
- sharp quality
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ],
      config: {
        responseModalities: ["IMAGE"]
      }
    });


    const imagePart =
      response.candidates?.[0]?.content?.parts?.find(
        (part:any) => part.inlineData
      );


    if (!imagePart?.inlineData) {
      res.status(500).json({
        error: "No image generated"
      });
      return;
    }


    res.json({
      imageData: imagePart.inlineData.data
    });


  } catch (err:any) {

    console.error(
      "generate-image error:",
      err.message
    );

    res.status(500).json({
      error: "Image generation failed"
    });
  }
});
export default router;
