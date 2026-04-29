import { HeroStoryboard } from "@/components/ui/HeroStoryboard";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";
import { HowItWorksSection } from "@/components/ui/HowItWorksSection";
import { DebateSection } from "@/components/ui/DebateSection";
import { BigStatementSection } from "@/components/ui/BigStatementSection";
import { FeatureGridSection } from "@/components/ui/FeatureGridSection";
import { FinalCTASection } from "@/components/ui/FinalCTASection";

export default function Landing() {
  return (
    <main className="min-h-screen w-full bg-black flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      <HeroStoryboard />
      <MarqueeStrip />
      <HowItWorksSection />
      <DebateSection />
      <BigStatementSection />
      <FeatureGridSection />
      <FinalCTASection />
    </main>
  );
}
