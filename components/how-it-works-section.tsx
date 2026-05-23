import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and tell us about yourself - your age, state, income, and category.",
  },
  {
    step: "02",
    title: "Get Recommendations",
    description: "Our smart matching system finds schemes you are eligible for automatically.",
  },
  {
    step: "03",
    title: "Track & Apply",
    description: "Save schemes, track required documents, and apply with confidence.",
  },
]

const benefits = [
  "Personalized scheme recommendations",
  "Document checklist tracker",
  "Direct application links",
  "Eligibility verification",
  "Save and bookmark schemes",
  "100% free to use",
]

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Three simple steps to discover and apply for government schemes.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <div key={index} className="relative text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-2xl font-bold text-primary">{item.step}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-border md:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border bg-card p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Why Use Smart Citizen?</h3>
              <p className="mt-2 text-muted-foreground">
                We simplify the process of finding and applying for government schemes.
              </p>
              <Link href="/auth/signup" className="mt-6 inline-block">
                <Button size="lg" className="gap-2">
                  Start Now
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="size-5 shrink-0 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
