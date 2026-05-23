import Link from "next/link"
import {
  GraduationCap,
  Tractor,
  Briefcase,
  Heart,
  Home,
  Coins,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const categories = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Scholarships, educational loans, and skill development programs",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Tractor,
    title: "Farmers",
    description: "Agricultural subsidies, crop insurance, and income support",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Briefcase,
    title: "Entrepreneurs",
    description: "Business loans, startup grants, and MSME support schemes",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Heart,
    title: "Healthcare",
    description: "Health insurance, medical assistance, and wellness programs",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Home,
    title: "Housing",
    description: "Affordable housing schemes and home loan subsidies",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Coins,
    title: "Pension",
    description: "Retirement benefits and social security for senior citizens",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
]

export function CategoriesSection() {
  return (
    <section className="border-t bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Schemes for Every Need
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            From education to healthcare, find government initiatives designed to support
            you at every stage of life.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.title} href={`/schemes?category=${category.title.toLowerCase()}`}>
              <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <div
                    className={`mb-2 flex size-12 items-center justify-center rounded-lg ${category.bgColor}`}
                  >
                    <category.icon className={`size-6 ${category.color}`} />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{category.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
