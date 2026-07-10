import { useEffect, useState } from "react";
import { WORDS, WordEntry } from "@/data/words";

const CUSTOM_WORDS_KEY = "lexora_custom_words";

export function readCustomWords(): WordEntry[] {
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
    return raw ? (JSON.parse(raw) as WordEntry[]) : [];
  } catch {
    return [];
  }
}

function writeCustomWords(words: WordEntry[]) {
  localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
  window.dispatchEvent(new Event("lexora:custom-words-changed"));
}

/** Persist a word found via live lookup so it shows up in Words/Explore/Saved too. */
export function saveCustomWord(entry: WordEntry) {
  const existing = readCustomWords();
  if (existing.some((w) => w.id === entry.id)) return;
  writeCustomWords([...existing, entry]);
}

/** Curated headwords + anything the user has looked up live, merged and de-duped. */
export function useAllWords(): WordEntry[] {
  const [customWords, setCustomWords] = useState<WordEntry[]>(readCustomWords);

  useEffect(() => {
    const sync = () => setCustomWords(readCustomWords());
    window.addEventListener("lexora:custom-words-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("lexora:custom-words-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const curatedIds = new Set(WORDS.map((w) => w.id));
  return [...WORDS, ...customWords.filter((w) => !curatedIds.has(w.id))];
}
