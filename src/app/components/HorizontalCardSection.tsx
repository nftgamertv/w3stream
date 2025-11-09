import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import Image from "next/image" // Import Image component
import { Badge } from "./ui/badge"

interface HorizontalCardSectionProps {
  title: string
  items: {
    icon: LucideIcon
    title: string
    description: string
    buttonText: string
    buttonLink: string
    gradientFrom: string
    gradientTo: string
    imageUrl?: string // Added optional imageUrl
    status?: "concept" | "in development" | "testing" | "live"
    cost?: string
  }[]
}

export function HorizontalCardSection({ title, items }: HorizontalCardSectionProps) {
  return (
    <section className="my-4">
      <h2 className="text-2xl font-bold text-white my-8">{title}</h2>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 shadow-lg backdrop-blur-xs">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="absolute inset-0 object-cover -z-20 opacity-20 " // Image at the very back
                  />
                )}
                <div
                  className={cn(
                    "absolute inset-0 -z-10",
                    item.imageUrl
                      ? `bg-linear-to-br ${item.gradientFrom}/30 ${item.gradientTo}/30 bg-black/50` // Overlay for image: subtle gradient + dark tint
                      : `bg-linear-to-br ${item.gradientFrom} ${item.gradientTo} opacity-30 blur-xl`, // Fallback gradient for no image
                  )}
                />
                <CardContent className="relative z-0 flex flex-col p-6 min-h-52">
                  <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} className="w-24 h-12 relative z-10" />
                  <Badge
                    variant="outline"
                    className="absolute top-4 right-4 text-[10px] px-4 py-1 flex items-center gap-1"
                  >
                    {item.cost === "paid" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 397.7 311.7"
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline-block"
                      >
                        <defs>
                          <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#00FFA3", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#DC1FFF", stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <path
                          fill="url(#solanaGradient)"
                          d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
                        />
                        <path
                          fill="url(#solanaGradient)"
                          d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
                        />
                        <path
                          fill="url(#solanaGradient)"
                          d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
                        />
                      </svg>
                    )}
                    {item.cost}
                  </Badge>
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-slate-400 text-sm text-balance">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <a
                      href={item.buttonLink}
                      className="relative mt-6  inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-full border border-cyan-500/30 bg-linear-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300"
                    >
                      {item.buttonText}
                    </a>
                    <span className="absolute bottom-4 right-8">
                      {item.status && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-4 py-1
                      ${item.status === "live" ? "bg-green-600" : ""}${
                        item.status === "testing" ? "bg-orange-700 text-yellow-300" : ""
                      }${item.status === "in development" ? "bg-blue-700 text-blue-200" : ""}${
                        item.status === "concept" ? "bg-gray-800 text-gray-100" : ""
                      }
                      `}
                        >
                          {item.status}
                        </Badge>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  )
}
