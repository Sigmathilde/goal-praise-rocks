import { CheckCircle2, Users, Sparkles, Award } from "lucide-react";

const steps = [
  {
    icon: CheckCircle2,
    title: "Set Your Goals",
    description: "Choose up to three goals that matter most to you right now. Make them specific, meaningful, and achievable.",
  },
  {
    icon: Users,
    title: "Share Your Journey",
    description: "Your goals become visible to the community. Others can see your commitment and offer their support.",
  },
  {
    icon: Sparkles,
    title: "Give & Receive Praise",
    description: "Encourage others on their path and receive motivation when you need it most. Build lasting connections.",
  },
  {
    icon: Award,
    title: "Celebrate Achievements",
    description: "Complete a goal and it becomes permanent—written in stone. Make room for your next challenge.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your aspirations into lasting achievements
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex gap-6 pb-12 last:pb-0">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-full bg-border" />
              )}

              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-achievement flex items-center justify-center shadow-achievement">
                  <step.icon className="w-6 h-6 text-achievement-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
