"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-teal-500/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <Card className="glass-card p-12">
          <CardContent className="p-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Migrate Your Token?</h2>
            <p className="text-slate-400 mb-8 text-lg">
              Start your secure token migration journey with w3Swap. Get started today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/w3swap/contact">
                <Button className="btn-brand inline-flex items-center gap-2 group w-full sm:w-auto">
                  Apply Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/w3swap/faq">
                <Button variant="outline" className="border-slate-700 text-cyan-500 hover:border-cyan-500/80 w-full sm:w-auto">
                  Browse FAQ
                </Button>
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-6">Questions? Our team typically responds within 24 hours.</p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}


