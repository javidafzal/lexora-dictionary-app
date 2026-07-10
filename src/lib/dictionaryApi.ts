import type { WordEntry } from "@/data/words";

/**
 * Live word lookup, backed by the free, keyless dictionaryapi.dev service
 * (definitions sourced from Wiktionary). This is what makes "any English
 * word" searchable, not just the curated headwords in src/data/words.ts.
 *
 * Note: this endpoint doesn't provide etymology, so origin/originLanguage
 * are left as a clear placeholder rather than guessed.
 */

interface DictionaryApiPhonetic {
  text?: string;
  audio?: string;
}

interface DictionaryApiDefinition {
  definition: string;
  example?: string;
}

interface DictionaryApiMeaning {
  partOfSpeech: string;
  definitions: DictionaryApiDefinition[];
}

interface DictionaryApiEntry {
  word: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  meanings: DictionaryApiMeaning[];
}

export class WordNotFoundError extends Error {}

export async function lookupWordOnline(word: string): Promise<WordEntry> {
  const clean = word.trim().toLowerCase();
  if (!clean) throw new WordNotFoundError("Enter a word to look up.");

  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);

  if (res.status === 404) {
    throw new WordNotFoundError(`No dictionary entry found for "${word}".`);
  }
  if (!res.ok) {
    throw new Error(`Lookup failed (${res.status}). Try again in a moment.`);
  }

  const data = (await res.json()) as DictionaryApiEntry[];
  const entry = data[0];
  if (!entry) throw new WordNotFoundError(`No dictionary entry found for "${word}".`);
  const meaning = entry.meanings?.[0];
  const definition = meaning?.definitions[0];
  const phonetic = entry.phonetic ?? entry.phonetics?.find((p) => p.text)?.text ?? "";

  return {
    id: `live:${clean}`,
    word: entry.word,
    pronunciation: phonetic,
    partOfSpeech: meaning?.partOfSpeech ?? "—",
    definition: definition?.definition ?? "No definition available.",
    origin: "Etymology isn't available from live lookup — this word isn't in Lexora's curated origin stories yet.",
    originLanguage: "—",
    example: definition?.example ?? "",
  };
}
