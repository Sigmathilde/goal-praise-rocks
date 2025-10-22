import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
          Ready to Carve Your Path?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Join a community committed to turning goals into achievements. Start your journey today.
        </p>
        <Button size="lg" variant="achievement" className="text-lg">
          Get Started Now <ArrowRight className="ml-2" />
        </Button>
      </div>
    </section>
  );
};

export default CTA;
