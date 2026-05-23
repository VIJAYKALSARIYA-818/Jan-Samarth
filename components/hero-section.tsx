"use client"

import { useState } from "react"
import Link from "next/link"
import { PhysicsCards } from "@/components/physics-cards"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Scheme } from "@/lib/types"
import { ArrowRight, CheckCircle, ExternalLink } from "lucide-react"

interface HeroSectionProps {
  schemes: Scheme[]
}

export function HeroSection({ schemes }: HeroSectionProps) {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)

  return (
    <section className="relative">
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Empowering Citizens
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Discover Government Schemes{" "}
            <span className="text-primary">Made for You</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Complete your profile and get personalized recommendations for scholarships,
            subsidies, pensions, and benefits you are eligible for.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/schemes">
              <Button variant="outline" size="lg">
                Browse All Schemes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Physics Cards Section */}
      <div className="h-[500px] w-full md:h-[600px]">
        <PhysicsCards schemes={schemes} onCardClick={setSelectedScheme} />
      </div>

      {/* Scheme Detail Dialog */}
      <Dialog open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedScheme && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">{selectedScheme.category}</Badge>
                </div>
                <DialogTitle className="text-xl">
                  {selectedScheme.name}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedScheme.ministry}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedScheme.description}
                  </p>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Benefits</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedScheme.benefits}
                  </p>
                </div>

                {selectedScheme.documents_required &&
                  selectedScheme.documents_required.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Documents Required</h4>
                      <ul className="space-y-1">
                        {selectedScheme.documents_required.map((doc, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle className="size-4 text-primary" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="flex gap-3 pt-4">
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full">Check Eligibility</Button>
                  </Link>
                  {selectedScheme.application_url && (
                    <a
                      href={selectedScheme.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="gap-2">
                        Apply
                        <ExternalLink className="size-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
