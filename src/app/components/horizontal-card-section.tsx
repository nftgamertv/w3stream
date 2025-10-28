import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import Image from "next/image" // Import Image component

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
                    src={item.imageUrl  }
                    alt={item.title}
                    fill
                    className="absolute inset-0 object-cover -z-20" // Image at the very back
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
                <CardContent className="relative z-0 flex flex-col p-6">
                  <div
                    className={cn(
                      "relative flex size-16 items-center justify-center rounded-xl",
                      `bg-linear-to-br ${item.gradientFrom} ${item.gradientTo}`,
                    )}
                  >
                    <div className="absolute inset-0 rounded-xl bg-black/20" />
                    <item.icon className="relative z-10 size-8 text-white" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-slate-400 text-sm">{item.description}</p>
                  <div className="mt-6">
                    <a
                      href={item.buttonLink}
                      className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-full border border-cyan-500/30 bg-linear-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300"
                    >
                      {item.buttonText}
                    </a>
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
