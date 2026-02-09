// Landing Page
import Link from 'next/link';
import {
  Heart,
  Brain,
  Apple,
  Dumbbell,
  Calendar,
  MessageCircle,
  Shield,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { GradientButton } from '@/components/ui/gradient-button';
import { Typewriter } from '@/components/ui/typewriter';
import { FreeDietPlanGenerator } from '@/components/landing/FreeDietPlanGenerator';
import { SuccessStory } from '@/components/landing/SuccessStory';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-health-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-health-bg/80 backdrop-blur-md border-b border-health-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-health-text leading-tight">Health</span>
              <div className="text-sm font-medium text-primary-500">
                <Typewriter
                  text={["Agent", "Partner", "Advisor"]}
                  speed={70}
                  waitTime={1500}
                  deleteSpeed={40}
                  cursorChar={"_"}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <GradientButton asChild variant="variant" className="min-w-[100px] px-4 py-2 h-10 text-sm">
                <Link href="/login">
                  Sign In
                </Link>
              </GradientButton>
              <GradientButton asChild className="min-w-[120px] px-6 py-2 h-10 text-sm">
                <Link href="/register">
                  Get Started
                </Link>
              </GradientButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <BackgroundPaths title="Your Personal AI Health Assistant">
        <div className="flex flex-col items-center">
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10">
            Get personalized diet plans, exercise routines, yoga recommendations, and health guidance tailored to your unique profile. Powered by advanced AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GradientButton asChild className="z-20 text-lg h-14 min-w-[200px] cursor-pointer">
              <Link href="#try-diet-planner">
                Try Free AI Diet Plan
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </GradientButton>
            <GradientButton asChild variant="variant" className="z-20 text-lg h-14 min-w-[200px]">
              <Link href="/login">
                I already have an account
              </Link>
            </GradientButton>
          </div>
        </div>

      </BackgroundPaths>

      {/* Free Diet Plan Generator */}
      <FreeDietPlanGenerator />


      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-health-text mb-4">Everything You Need for Better Health</h2>
            <p className="text-health-muted max-w-2xl mx-auto">
              Comprehensive health management powered by AI, designed around your unique health profile
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="AI Health Chat"
              description="Ask health questions and get personalized answers based on your health profile"
              color="primary"
            />
            <FeatureCard
              icon={<Apple className="w-6 h-6" />}
              title="Diet Recommendations"
              description="Personalized meal plans considering your conditions, allergies, and goals"
              color="green"
            />
            <FeatureCard
              icon={<Dumbbell className="w-6 h-6" />}
              title="Exercise Plans"
              description="Safe workout routines tailored to your fitness level and any injuries"
              color="blue"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              title="Yoga Sessions"
              description="Yoga poses mapped to body parts and health conditions with safety guidelines"
              color="purple"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Doctor Appointments"
              description="Book appointments with natural language - just say when you want to visit"
              color="orange"
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Health Assessment"
              description="Track BMI, activity, sleep, and stress scores with AI-powered insights"
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-health-text mb-4">How It Works</h2>
            <p className="text-health-muted max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Create Your Profile"
              description="Answer a few questions about your health, conditions, and goals to build your unique health profile"
            />
            <StepCard
              number="2"
              title="Get Personalized Advice"
              description="Receive AI-powered recommendations for diet, exercise, and yoga tailored specifically to you"
            />
            <StepCard
              number="3"
              title="Track & Improve"
              description="Monitor your progress, book doctor appointments, and continuously improve your health"
            />
          </div>
        </div>
      </section>

      {/* Success Story */}
      <SuccessStory />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-health-text mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-health-muted mb-8">
            Join thousands of users who are taking control of their health with AI-powered guidance
          </p>
          <GradientButton asChild className="text-lg h-14 px-8">
            <Link href="/register">
              Create Free Account
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </GradientButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-health-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-health-text">Health Agent</span>
          </div>
          <p className="text-sm text-health-muted">
            © {new Date().getFullYear()} Health Agent. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
  };

  return (
    <div className="card card-hover">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-health-text mb-2">{title}</h3>
      <p className="text-health-muted">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-health-text mb-2">{title}</h3>
      <p className="text-health-muted">{description}</p>
    </div>
  );
}
