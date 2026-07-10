import { PageShell } from "@/components/layout/PageShell";
import { useAllWords } from "@/lib/customWords";
import { Link } from "react-router-dom";

export default function Words() {
  const allWords = useAllWords();
  const sorted = [...allWords].sort((a, b) => a.word.localeCompare(b.word));

  return (
    <PageShell>
      <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Browse the dictionary</h1>
      <p className="text-white/60 mb-10 max-w-xl">
        Every headword currently in Lexora, A to Z.
      </p>

      <div className="divide-y divide-white/10 border-t border-b border-white/10">
        {sorted.map((w) => (
          <Link
            key={w.id}
            to={`/origins?word=${w.id}`}
            className="flex items-center justify-between py-4 group hover:bg-white/[0.03] px-2 -mx-2 transition-colors"
          >
            <div>
              <span className="font-serif text-xl group-hover:text-amber-300 transition-colors">{w.word}</span>
              <span className="text-white/40 text-xs ml-3">{w.partOfSpeech}</span>
            </div>
            <span className="text-white/40 text-xs">{w.pronunciation}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
