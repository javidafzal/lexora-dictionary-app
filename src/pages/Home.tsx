import { useMemo } from "react";
import { HeroSection } from "@/components/ui/hero-odyssey";
import { CosmicSpectrum } from "@/components/ui/cosmos-spectrum";
import { WORDS } from "@/data/words";

export default function Home() {
  // A rotating sequence of words, starting from a "word of the day" so it's
  // deterministic and doesn't reshuffle on every re-render. As the user
  // scrolls through the hero section, CosmicSpectrum steps through this list.
  const featuredWords = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    const count = Math.min(6, WORDS.length);
    return Array.from({ length: count }, (_, i) => WORDS[(dayIndex + i) % WORDS.length]);
  }, []);

  return (
    <div className="w-full bg-black">
      <HeroSection />
      <CosmicSpectrum color="sunset" blur words={featuredWords} />
    </div>
  );
}
