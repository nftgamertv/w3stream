"use client"

import { motion } from "framer-motion"
import { Shield, Users, BarChart3, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const benefits = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Secure on-chain migration process with transparent operations and automated execution.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Transparent communication and holder support throughout the migration.",
  },
  {
    icon: BarChart3,
    title: "Market Stability",
    description: "Strategies to maintain token value and prevent volatility during migration.",
  },
  {
    icon: Clock,
    title: "Quick Deployment",
    description: "Efficient timelines without compromising security or thoroughness.",
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-slate-950/50 to-black relative">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-6 text-white">Why Choose w3Swap</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Industry-leading expertise and commitment to project success.
          </p>
        </div>
        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="glass-card p-6 hover:border-cyan-500/50 transition-all duration-300 group flex gap-4 h-full">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                      <Icon className="h-6 w-6 text-cyan-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-white">{benefit.title}</h3>
                    <p className="text-sm text-slate-400">{benefit.description}</p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


