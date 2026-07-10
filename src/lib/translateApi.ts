/**
 * Definition translation, backed by the free, keyless MyMemory Translation
 * API. Good enough for short dictionary definitions; not meant for heavy
 * volume (MyMemory rate-limits anonymous requests to ~5,000 words/day).
 */

export interface Language {
  code: string;
  label: string;
}

// 18 languages, chosen for broad global coverage.
export const LANGUAGES: Language[] = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" },
  { code: "ru", label: "Russian" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "id", label: "Indonesian" },
];

interface MyMemoryResponse {
  responseData: { translatedText: string };
  responseStatus: number;
}

export async function translateText(text: string, targetLangCode: string): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=en|${targetLangCode}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Translation service is unavailable right now.");

  const data = (await res.json()) as MyMemoryResponse;
  if (data.responseStatus !== 200) throw new Error("Translation failed for this text.");

  return data.responseData.translatedText;
}
