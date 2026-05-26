import { ChatWidget } from "@/components/chat/ChatWidget";
import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { KPISection } from "@/components/landing/KPISection";
import { ValueCards } from "@/components/landing/ValueCards";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ValueCards />
        <ArchitectureSection />
        <KPISection />
      </main>
      <ChatWidget />
    </>
  );
}
