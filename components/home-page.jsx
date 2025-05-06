"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useInView } from "framer-motion"
import { ArrowRight, ChevronRight, Dumbbell, Utensils, Users, ShoppingBag, Calendar, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnimatedBackground } from "@/components/animated-background"

const features = [
  {
    icon: <Dumbbell className="h-10 w-10 text-primary" />,
    title: "Personalized Workouts",
    description: "Get customized workout plans tailored to your fitness goals and experience level.",
  },
  {
    icon: <Utensils className="h-10 w-10 text-primary" />,
    title: "Diet Tracking",
    description: "Track your nutrition, calories, and macros with our easy-to-use diet tracker.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Community Support",
    description: "Join fitness groups, share progress, and stay motivated with like-minded individuals.",
  },
  {
    icon: <ShoppingBag className="h-10 w-10 text-primary" />,
    title: "Fitness Marketplace",
    description: "Shop for fitness equipment, supplements, and workout gear from trusted brands.",
  },
  {
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Event Planning",
    description: "Organize and join fitness events, challenges, and group workouts in your area.",
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: "Progress Tracking",
    description: "Monitor your fitness journey with detailed analytics and achievement badges.",
  },
]

const testimonials = [
  {
    quote:
      "FitFaat has completely transformed my fitness journey. The personalized workouts and nutrition tracking have helped me lose 15kg in just 3 months!",
    author: "Sarah J.",
    role: "Lost 15kg in 3 months",
    avatar: "/diverse-group.png",
  },
  {
    quote:
      "The community features are amazing! I've found workout partners and joined fitness challenges that keep me motivated every day.",
    author: "Michael T.",
    role: "Fitness enthusiast",
    avatar: "/diverse-group.png",
  },
  {
    quote:
      "As a busy professional, FitFaat's quick workout routines and meal planning tools have made staying healthy so much easier.",
    author: "Priya K.",
    role: "Software Engineer",
    avatar: "/diverse-group.png",
  },
  {
    quote:
      "The marketplace has everything I need for my home gym. Great prices and the recommendations are always spot on!",
    author: "David L.",
    role: "Home fitness advocate",
    avatar: "/diverse-group.png",
  },
]

function FeatureCard({ icon, title, description, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 flex flex-col items-start">
          <div className="rounded-full bg-primary/10 p-3 mb-4">{icon}</div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AutoCarousel({ items }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)
  const isInView = useInView(carouselRef)

  useEffect(() => {
    if (!isInView) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % (items.length - 2 > 0 ? items.length - 2 : 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [items.length, isInView])

  return (
    <div
      ref={carouselRef}
      className="relative overflow-hidden rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 max-w-3xl mx-auto w-full"
    >
      <div
        className="flex gap-4 transition-all duration-500 ease-in-out"
        style={{ transform: `translateX(calc(-${activeIndex} * (300px + 1rem)))` }}
      >
        {items.map((item, index) => (
          <div key={index} className="min-w-[300px] md:min-w-[350px] px-3">
            <div className="bg-card p-4 rounded-lg shadow-sm h-full">
              <div className="flex flex-col space-y-3">
                <p className="text-sm italic line-clamp-4">"{item.quote}"</p>
                <div className="flex items-center space-x-3 mt-auto">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image src={item.avatar || "/placeholder.svg"} alt={item.author} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.author}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              activeIndex === index ? "bg-primary w-4" : "bg-muted",
            )}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

function ScrollingStats() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
      <StatCard startValue={0} endValue={10000} label="Active Users" scrollYProgress={scrollYProgress} />
      <StatCard startValue={0} endValue={500} label="Workout Plans" scrollYProgress={scrollYProgress} />
      <StatCard startValue={0} endValue={150} label="Communities" scrollYProgress={scrollYProgress} />
    </div>
  )
}

function StatCard({ startValue, endValue, label, scrollYProgress }) {
  const [displayValue, setDisplayValue] = useState(startValue)

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      const value = Math.floor(startValue + (endValue - startValue) * latest)
      setDisplayValue(value)
    })

    return () => unsubscribe()
  }, [scrollYProgress, startValue, endValue])

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <motion.h3 className="text-4xl font-bold mb-2">{displayValue.toLocaleString()}+</motion.h3>
        <p className="text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transform Your <span className="text-primary">Fitness Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Track workouts, monitor nutrition, join communities, and shop for fitness gear - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/workout">
                  Explore Workouts <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl"
          >
            <Image src="/placeholder.svg?key=elb3f" alt="FitFaat App Dashboard" fill className="object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <AnimatedBackground />

      <HeroSection />

      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose FitFaat?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our all-in-one fitness platform provides everything you need to achieve your health and fitness goals.
            </p>
          </div>

          <ScrollingStats />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their fitness journey with FitFaat.
            </p>
          </div>

          <AutoCarousel items={testimonials} />
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Start Your Fitness Journey?</h2>
              <p className="text-muted-foreground mb-6">
                Join FitFaat today and get access to personalized workouts, nutrition tracking, community support, and
                more.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative h-[300px] w-full md:w-[500px] rounded-xl overflow-hidden shadow-lg">
              <Image src="/placeholder.svg?key=9pukp" alt="FitFaat Community" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
