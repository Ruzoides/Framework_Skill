import { Hero } from "@/components/marketing/hero";
import { LogoStrip } from "@/components/marketing/logo-strip";
import { Features } from "@/components/marketing/features";
import { ProofSection } from "@/components/marketing/proof-section";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { Faq } from "@/components/marketing/faq";
import { CtaBand } from "@/components/marketing/cta-band";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <Features />
      <ProofSection />
      <PricingTeaser />
      <Faq />
      <CtaBand />
    </>
  );
}
