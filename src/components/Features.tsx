import { Target, Heart, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Three Goals Only",
    description: "Focus on what truly matters. Set three meaningful goals and give them your full attention until they're achieved.",
  },
  {
    icon: Heart,
    title: "Community Praise",
    description: "Receive support and recognition from others on their journey. Give and receive encouragement that fuels motivation.",
  },
  {
    icon: Trophy,
    title: "Eternal Achievements",
    description: "When you complete a goal, it becomes a permanent achievement—written in stone for you and your community to see.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-gradient-stone">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Forge Your Legacy
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A focused approach to goal achievement with the support of a community that believes in you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-stone hover:shadow-elevated transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-glow flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
