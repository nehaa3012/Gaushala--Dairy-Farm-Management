"use client"

import { motion, Variants } from "framer-motion"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Beef,
  DollarSign,
  FileText,
  Milk,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  Check,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GLSLHills } from "@/components/ui/glsl-hills"
import { AnimatedWaves } from "@/components/ui/animated-waves"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
}

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard")
    }
  }, [isSignedIn, router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const features = [
    {
      icon: Beef,
      title: "Cow Management",
      description:
        "Track your herd with detailed profiles, health records, and status monitoring",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Milk,
      title: "Milk Deliveries",
      description:
        "Manage daily milk deliveries with automated tracking and customer records",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Get insights with comprehensive reports and real-time analytics dashboard",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: DollarSign,
      title: "Financial Tracking",
      description:
        "Monitor expenses, revenue, and profitability with detailed financial reports",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Customer Management",
      description:
        "Maintain customer database with billing history and payment tracking",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      icon: FileText,
      title: "PDF Reports",
      description:
        "Generate professional PDF reports for monthly summaries and statements",
      gradient: "from-yellow-500 to-orange-500",
    },
  ]

  const stats = [
    { value: "99%", label: "Uptime", icon: Shield },
    { value: "24/7", label: "Support", icon: Zap },
    { value: "500+", label: "Happy Users", icon: TrendingUp },
    { value: "100%", label: "Secure", icon: Shield },
  ]

  const benefits = [
    "Real-time data synchronization",
    "Automated billing & invoicing",
    "Multi-device access",
    "Cloud-based storage",
    "Advanced analytics",
    "Export to PDF/Excel",
  ]

  if (isSignedIn) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Layered 3D Background */}
      <div className="fixed inset-0 z-0">
        {/* GLSL Hills 3D layer */}
        <div className="absolute inset-0">
          <GLSLHills
            width="100vw"
            height="100vh"
            cameraZ={125}
            planeSize={256}
            speed={0.3}
          />
        </div>

        {/* Animated Waves fallback/enhancement */}
        <div className="absolute inset-0">
          <AnimatedWaves />
        </div>

        {/* Gradient Orbs Overlay - Grey/Silver shades */}
        <motion.div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-gray-600/30 to-gray-500/30 blur-3xl"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", damping: 30 }}
        />
        <motion.div
          className="absolute -right-40 -bottom-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-gray-700/30 to-gray-600/30 blur-3xl"
          animate={{
            x: -mousePosition.x * 0.02,
            y: -mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", damping: 30 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-slate-600/25 to-slate-500/25 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                <Milk className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-xl font-bold text-transparent">
                Gaushala
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 transition-transform duration-700 group-hover:translate-x-[100%]" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32">
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <Badge className="mb-4 gap-2 px-4 py-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  Modern Dairy Farm Management
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-5xl leading-tight font-bold tracking-tight text-transparent md:text-7xl"
              >
                Manage Your Dairy Farm{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mb-10 text-lg text-muted-foreground md:text-xl"
              >
                Complete solution for managing cows, tracking milk deliveries,
                handling finances, and generating reports. Everything you need
                in one powerful platform.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group relative h-12 overflow-hidden px-8 text-base"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 transition-transform group-hover:scale-105" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-2 px-8 text-base"
                  >
                    Learn More
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    whileHover={{ scale: 1.05 }}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 py-20">
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mx-auto max-w-6xl"
            >
              <motion.div variants={fadeInUp} className="mb-16 text-center">
                <Badge className="mb-4" variant="outline">
                  Features
                </Badge>
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  Everything You Need
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Powerful features designed to streamline your dairy farm
                  operations and boost productivity
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div key={index} variants={scaleIn}>
                    <Card className="group relative h-full overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                      />
                      <CardContent className="relative p-6">
                        <div
                          className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                        >
                          <feature.icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="mx-auto max-w-5xl"
            >
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <motion.div variants={fadeInUp}>
                  <Badge className="mb-4" variant="outline">
                    Why Choose Us
                  </Badge>
                  <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                    Built for Modern Dairy Farms
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">
                    Our platform combines simplicity with power, giving you all
                    the tools you need to run a successful dairy farm operation.
                  </p>

                  <div className="grid gap-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={scaleIn} className="relative">
                  <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-8 backdrop-blur-sm">
                    <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 blur-3xl" />

                    <div className="relative space-y-6">
                      <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                          <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Mobile Responsive</div>
                          <div className="text-sm text-muted-foreground">
                            Access anywhere, anytime
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Secure & Private</div>
                          <div className="text-sm text-muted-foreground">
                            Your data is encrypted
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">Lightning Fast</div>
                          <div className="text-sm text-muted-foreground">
                            Optimized performance
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-12 text-center backdrop-blur-sm md:p-20"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

              <div className="relative z-10">
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Join hundreds of dairy farmers who are already managing their
                  farms more efficiently with Gaushala
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="group h-14 px-10 text-lg">
                      <span className="flex items-center gap-2">
                        Start Your Free Trial
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 border-2 px-10 text-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 px-4 py-12">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                  <Milk className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-xl font-bold text-transparent">
                  Gaushala
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                © 2024 Gaushala. All rights reserved.
              </p>

              <div className="flex gap-6">
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of Service
                </Link>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
