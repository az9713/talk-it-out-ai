import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Shield, Users, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-xl font-bold">Relationship Debugger</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Resolve conflicts with
          <span className="text-rose-500"> compassion</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          An AI-powered mediator that helps couples and teams work through disagreements
          using proven therapy techniques. Find understanding, not winners.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/login">
              Start Your First Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Relationship Debugger?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <MessageCircle className="h-12 w-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Guided Conversations</h3>
              <p className="text-gray-600">
                Our AI mediator uses Nonviolent Communication (NVC) techniques to
                guide you through structured, productive discussions.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Both Perspectives Heard</h3>
              <p className="text-gray-600">
                Each person gets equal time to share their observations, feelings,
                needs, and requests without interruption.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Safe & Private</h3>
              <p className="text-gray-600">
                Your conversations are private and secure. Built-in safety checks
                ensure healthy communication boundaries.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect', desc: 'Invite your partner or team member to join' },
              { step: '2', title: 'Share', desc: 'Each person describes their perspective' },
              { step: '3', title: 'Understand', desc: 'AI helps identify feelings and needs' },
              { step: '4', title: 'Resolve', desc: 'Find common ground and agreements' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built on Proven Therapy Techniques
          </h2>
          <div className="space-y-4">
            {[
              'Nonviolent Communication (NVC) framework by Marshall Rosenberg',
              'Focuses on observations, not judgments',
              'Helps identify underlying feelings and needs',
              'Creates space for clear, actionable requests',
              'Safety monitoring for healthy boundaries',
              'Available 24/7 when you need to talk',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-rose-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to improve your communication?
          </h2>
          <p className="text-rose-100 text-xl mb-8 max-w-2xl mx-auto">
            Start your first guided session today. No credit card required.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="font-semibold">Relationship Debugger</span>
          </div>
          <p className="text-gray-500 text-sm">
            This is not a substitute for professional therapy. If you are in crisis,
            please contact a mental health professional or crisis hotline.
          </p>
        </div>
      </footer>
    </div>
  );
}
