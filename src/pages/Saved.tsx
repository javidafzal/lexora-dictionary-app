import { PageShell } from "@/components/layout/PageShell";
import { useAllWords } from "@/lib/customWords";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

export default function Saved() {
  const { user, toggleSavedWord } = useAuth();
  const allWords = useAllWords();
  const savedWords = allWords.filter((w) => user?.savedWords.includes(w.id));

  return (
    <PageShell>
      <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Your saved words</h1>
      <p className="text-white/60 mb-10 max-w-xl">
        Signed in as {user?.email}. Words you save while exploring show up here.
      </p>

      {savedWords.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-white/60 mb-4">You haven't saved any words yet.</p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-sm hover:bg-amber-400/30 transition-colors"
          >
            Explore words
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {savedWords.map((w) => (
            <div key={w.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl">{w.word}</h2>
                  <p className="text-white/40 text-xs mt-1">
                    {w.pronunciation} · {w.partOfSpeech}
                  </p>
                </div>
                <button
                  onClick={() => toggleSavedWord(w.id)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                >
                  Remove
                </button>
              </div>
              <p className="text-white/80 text-sm mt-3">{w.definition}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
