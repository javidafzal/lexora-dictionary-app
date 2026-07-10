import { useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { LANGUAGES, translateText } from "@/lib/translateApi";

export function TranslateWidget({ text }: { text: string }) {
  const [langCode, setLangCode] = useState("");
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (code: string) => {
    setLangCode(code);
    setTranslated(null);
    setError(null);
    if (!code) return;
    setLoading(true);
    try {
      const result = await translateText(text, code);
      setTranslated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="flex items-center gap-2 text-white/50 text-xs">
        <Languages size={14} />
        <select
          value={langCode}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 outline-none focus:border-amber-400/60"
        >
          <option value="" className="text-black">
            Translate into…
          </option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-black">
              {lang.label}
            </option>
          ))}
        </select>
        {loading && <Loader2 size={14} className="animate-spin" />}
      </div>
      {translated && <p className="text-white/70 text-sm mt-2">{translated}</p>}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
