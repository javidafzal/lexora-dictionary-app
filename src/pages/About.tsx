import { Link } from "react-router-dom";
import { Search, Globe2, Languages, BookMarked, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { WORDS } from "@/data/words";
import { LANGUAGES } from "@/lib/translateApi";

const STEPS = [
  {
    icon: Search,
    title: "Look up any word",
    body: "Search Lexora's curated headwords, or search any English word — live results are pulled in from an open dictionary the moment you need them.",
  },
  {
    icon: Globe2,
    title: "Trace where it came from",
    body: "Every curated entry pairs its definition with a root language and an origin story, so you can follow a word back through Greek, Latin, Persian, and beyond.",
  },
  {
    icon: Languages,
    title: "Read it in your language",
    body: `Translate any definition into ${LANGUAGES.length} languages right on the page — no separate tab, no copy-paste.`,
  },
  {
    icon: BookMarked,
    title: "Keep the ones you love",
    body: "Create a free account and save words as you explore. Your list follows you back every time you sign in.",
  },
];

export default function About() {
  const originLanguages = Array.from(new Set(WORDS.map((w) => w.originLanguage))).sort();

  return (
    <PageShell>
      {/* Hero */}
      <div className="max-w-2xl mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80 mb-4 flex items-center gap-2">
          <Sparkles size={14} /> About Lexora
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-light mb-6 leading-tight">
          A definition is only half the story.
        </h1>
        <p className="text-white/70 text-lg leading-relaxed">
          Lexora pairs plain-language definitions with the origin story behind each word —
          the language it traveled from, the century it arrived, and the meaning it carried
          along the way.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <StatCard value={`${WORDS.length}+`} label="Curated origin stories" />
        <StatCard value="∞" label="Words searchable live" />
        <StatCard value={`${LANGUAGES.length}`} label="Translation languages" />
        <StatCard value={`${originLanguages.length}`} label="Root languages traced" />
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="font-serif text-2xl md:text-3xl font-light mb-8">How Lexora works</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="w-10 h-10 rounded-full bg-amber-400/15 text-amber-300 flex items-center justify-center mb-4">
                <Icon size={18} />
              </div>
              <h3 className="font-serif text-xl mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Root languages showcase */}
      <div className="mb-16">
        <h2 className="font-serif text-2xl md:text-3xl font-light mb-6">Rooted in every tongue</h2>
        <p className="text-white/60 mb-6 max-w-xl">
          Lexora's curated words currently trace back through:
        </p>
        <div className="flex flex-wrap gap-2">
          {originLanguages.map((lang) => (
            <span
              key={lang}
              className="px-4 py-1.5 rounded-full text-sm border border-white/10 bg-white/[0.03] text-white/70"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl mb-2">Start tracing words of your own</h2>
          <p className="text-white/60 text-sm max-w-md">
            Free to use, no credit card — just an email and a password.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-full border border-white/15 text-sm text-white/80 hover:text-white hover:border-white/30 transition-colors"
          >
            Explore words
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-full bg-amber-400/90 hover:bg-amber-400 text-black text-sm font-medium transition-colors"
          >
            Create free account
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <p className="font-serif text-3xl md:text-4xl text-amber-300 mb-1">{value}</p>
      <p className="text-white/50 text-xs uppercase tracking-wide">{label}</p>
    </div>
  );
}
