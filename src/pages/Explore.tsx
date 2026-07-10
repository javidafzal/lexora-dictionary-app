import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { useAllWords, saveCustomWord } from "@/lib/customWords";
import { lookupWordOnline, WordNotFoundError } from "@/lib/dictionaryApi";
import type { WordEntry } from "@/data/words";
import { useAuth } from "@/context/AuthContext";
import { TranslateWidget } from "@/components/ui/translate-widget";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [liveResult, setLiveResult] = useState<WordEntry | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const { user, toggleSavedWord } = useAuth();
  const allWords = useAllWords();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allWords;
    return allWords.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.originLanguage.toLowerCase().includes(q)
    );
  }, [query, allWords]);

  const handleLiveLookup = async () => {
    setLiveLoading(true);
    setLiveError(null);
    setLiveResult(null);
    try {
      const entry = await lookupWordOnline(query);
      setLiveResult(entry);
      saveCustomWord(entry); // so it now shows up under Words/Explore/Saved too
    } catch (err) {
      setLiveError(err instanceof WordNotFoundError ? err.message : "Lookup failed. Try again.");
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <PageShell>
      <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Explore words</h1>
      <p className="text-white/60 mb-8 max-w-xl">
        Search Lexora's curated headwords, or look up any English word live and translate its
        definition into 18 languages.
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-10 max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “petrichor”, “Greek”, or any word at all…"
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-amber-400/60 transition-colors placeholder:text-white/30"
        />
        {results.length === 0 && query.trim() && (
          <button
            onClick={handleLiveLookup}
            disabled={liveLoading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-400/90 hover:bg-amber-400 text-black text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {liveLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Look up online
          </button>
        )}
      </div>

      {liveError && <p className="text-red-400 text-sm mb-6">{liveError}</p>}

      {liveResult && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-5 mb-8 max-w-xl">
          <p className="text-amber-300 text-xs mb-2">Found via live dictionary lookup</p>
          <h2 className="font-serif text-2xl">{liveResult.word}</h2>
          <p className="text-white/40 text-xs mt-1">
            {liveResult.pronunciation} · {liveResult.partOfSpeech}
          </p>
          <p className="text-white/80 text-sm mt-3">{liveResult.definition}</p>
          {liveResult.example && <p className="text-white/40 text-xs mt-3 italic">“{liveResult.example}”</p>}
          <TranslateWidget text={liveResult.definition} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((w) => {
          const saved = user?.savedWords.includes(w.id);
          return (
            <div key={w.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl">{w.word}</h2>
                  <p className="text-white/40 text-xs mt-1">
                    {w.pronunciation} · {w.partOfSpeech}
                  </p>
                </div>
                {user ? (
                  <button
                    onClick={() => toggleSavedWord(w.id)}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      saved
                        ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                        : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {saved ? "Saved" : "Save"}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Sign in to save
                  </Link>
                )}
              </div>
              <p className="text-white/80 text-sm mt-3">{w.definition}</p>
              {w.example && <p className="text-white/40 text-xs mt-3 italic">“{w.example}”</p>}
              <TranslateWidget text={w.definition} />
            </div>
          );
        })}
        {results.length === 0 && !liveResult && (
          <p className="text-white/40 text-sm col-span-full">
            No curated words match “{query}” — try “Look up online” above.
          </p>
        )}
      </div>
    </PageShell>
  );
}
