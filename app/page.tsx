import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Sparkles } from "lucide-react"
import Link from "next/link"
import { MindfulBotDemo } from "@/components/mindful-bot-demo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">MindfulSpace</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-blue-900 hover:text-blue-600">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-blue-900 hover:text-blue-600">
              How It Works
            </Link>
            <Link href="#therapists" className="text-sm font-medium text-blue-900 hover:text-blue-600">
              Find Therapists
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-blue-900 hover:text-blue-600">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Mental Wellness
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-blue-900 text-balance">
            Your Journey to Mental Wellness Starts Here
          </h1>
          <p className="mb-8 text-xl text-muted-foreground leading-relaxed text-pretty">
            Connect with AI-driven therapeutic insights and licensed mental health professionals. Track your mood,
            receive personalized recommendations, and find the support you deserve.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/sign-up">Start Your Journey</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              <Link href="#mindful-bot">Try Mindful Bot</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white/60 border-y border-blue-100">
        <div className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-3">
          <Card className="border-blue-100 shadow-sm">
            <CardContent className="space-y-3 p-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Personalized Insights</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-generated reflections tailor coping strategies, reminders, and gentle motivation to your daily mood
                check-ins.
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-100 shadow-sm">
            <CardContent className="space-y-3 p-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Human Connection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse verified therapists, read their approaches, and book sessions that match your pace and comfort
                level.
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-100 shadow-sm">
            <CardContent className="space-y-3 p-6 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Progress You Can See</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track trends, celebrate wins, and share highlights with your care team to stay aligned on goals that
                matter.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mindful Bot Demo & How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Side - Mindful Bot */}
            <div id="mindful-bot">
              <div className="mb-8">
                <h2 className="mb-4 text-3xl font-bold text-blue-900">Meet Mindful Bot</h2>
                <p className="text-lg text-muted-foreground text-pretty">
                  Experience our AI-powered companion. Share how you're feeling and receive empathetic, supportive
                  responses.
                </p>
              </div>
              <MindfulBotDemo />
            </div>

            {/* Right Side - How It Works */}
            <div>
              <div className="mb-8">
                <h2 className="mb-4 text-3xl font-bold text-blue-900">How It Works</h2>
                <p className="text-lg text-muted-foreground">Simple steps to begin your wellness journey</p>
              </div>

              <div className="space-y-6">
                <Card className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                      1
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-blue-900">Create Your Profile</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Complete a brief onboarding to help us understand your mental health needs and preferences.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-600">
                      2
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-blue-900">Track & Discover</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Log your daily mood and receive AI-powered insights and personalized wellness recommendations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                      3
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-blue-900">Connect & Grow</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Find the right therapist, schedule sessions, and continue your journey toward better mental
                      health.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapists CTA */}
      <section id="therapists" className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-blue-900">Find the right therapist for you</h2>
          <p className="max-w-2xl text-muted-foreground">
            Browse specialties, approaches, and availability from licensed professionals who are ready to support your
            goals. Filter by focus areas, session styles, and more to discover your best match.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/therapists">Browse Therapists</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MindfulSpace. Your mental wellness journey.</p>
        </div>
      </footer>
    </div>
  )
}
