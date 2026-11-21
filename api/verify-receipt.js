import { GoogleGenAI } from "@google/genai";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to verify a receipt image." });
  }

  const { imageData, mimeType } = req.body || {};
  if (typeof imageData !== "string" || !allowedTypes.has(mimeType)) {
    return res.status(400).json({ error: "Provide a supported receipt image (JPEG, PNG, WebP, or HEIC)." });
  }

  const image = Buffer.from(imageData, "base64");
  if (!image.length || image.length > MAX_IMAGE_BYTES) {
    return res.status(413).json({ error: "The receipt image must be no larger than 3 MB." });
  }
  if (image.toString("base64").replace(/=+$/, "") !== imageData.replace(/\s/g, "").replace(/=+$/, "")) {
    return res.status(400).json({ error: "The receipt image data is invalid." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(200).json({
      mode: "demo",
      agencyStamp: "Demo preview · no receipt analyzed",
      waybillNumber: "DEMO-SP-0001"
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: image.toString("base64")
          }
        },
        {
          text: 'Read this transport dispatch receipt. Extract the transport agency stamp/name and the waybill or tracking number. Return only a JSON object with string fields "agencyStamp" and "waybillNumber". If a value cannot be read, use "Not detected". Do not infer missing details.'
        }
      ]
    });
    const raw = typeof response.text === "function" ? response.text() : response.text;
    const parsed = JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
    if (typeof parsed.agencyStamp !== "string" || typeof parsed.waybillNumber !== "string") {
      return res.status(422).json({ error: "The receipt could not be read. Try a clearer image." });
    }
    return res.status(200).json({
      mode: "gemini",
      agencyStamp: parsed.agencyStamp.slice(0, 120),
      waybillNumber: parsed.waybillNumber.slice(0, 80)
    });
  } catch (error) {
    console.error("Gemini receipt verification failed.", error);
    return res.status(502).json({ error: "Receipt verification is temporarily unavailable. Please try again." });
  }
}
