import Header from "@/components/marketing/header";
import Hero from "@/components/marketing/hero";
import TrustedBy from "@/components/marketing/trustedby";
import PainPoints from "@/components/marketing/painpoints";
import Solution from "@/components/marketing/solution";
import Testimonials from "@/components/marketing/testimonials";
import Pricing from "@/components/marketing/pricing";
import Faq from "@/components/marketing/faq";
import Contact from "@/components/marketing/contact";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <Hero />
      <TrustedBy />
      <PainPoints />
      <Solution />
      <Testimonials />
      <Pricing />
      <Faq />
      <Contact />
    </div>
  );
}
