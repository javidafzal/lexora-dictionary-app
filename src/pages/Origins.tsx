import { useSearchParams, Link } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell";
import { WORDS } from "@/data/words";
import { TranslateWidget } from "@/components/ui/translate-widget";

export default function Origins() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get("word") ?? WORDS[0].id;
  const selected = WORDS.find((w) => w.id === selectedId) ?? WORDS[0];

  return (
    <PageShell>
      <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Trace an origin</h1>
      <p className="text-white/60 mb-10 max-w-xl">
        Pick a word to see the language and root it grew from.
      </p>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {WORDS.map((w) => (
            <button
              key={w.id}
              onClick={() => setSearchParams({ word: w.id })}
              className={`shrink-0 text-left px-4 py-2 rounded-full md:rounded-lg text-sm transition-colors ${
                w.id === selected.id
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {w.word}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="font-serif text-4xl mb-1">{selected.word}</h2>
          <p className="text-white/40 text-sm mb-6">
            {selected.pronunciation} · {selected.partOfSpeech}
          </p>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-amber-300/80 mb-1">Root language</p>
            <p className="text-white/90">{selected.originLanguage}</p>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-amber-300/80 mb-1">Origin story</p>
            <p className="text-white/80 leading-relaxed">{selected.origin}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-amber-300/80 mb-1">Definition</p>
            <p className="text-white/80 leading-relaxed">{selected.definition}</p>
            <TranslateWidget text={selected.definition} />
          </div>

          <Link
            to={`/explore`}
            className="inline-block mt-8 text-sm text-white/60 hover:text-white underline underline-offset-4"
          >
            Search more words like this →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
