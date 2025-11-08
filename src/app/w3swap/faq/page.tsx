"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const faqItems = [
  {
    question: "What is a token migration?",
    answer:
      "A token migration is the process of transitioning token holders from one blockchain or token contract to another. This might involve upgrading to a new chain, consolidating tokens, or implementing new functionality.",
  },
  {
    question: "How long does a migration typically take?",
    answer:
      "Most migrations take 4-12 weeks depending on complexity, community size, and regulatory requirements. We provide a detailed timeline during the assessment phase.",
  },
  {
    question: "Will there be any downtime?",
    answer:
      "No. We design all migrations for zero downtime. Token holders can continue trading and transacting throughout the migration process.",
  },
  {
    question: "How do you ensure security during migration?",
    answer:
      "We use secure on-chain migration processes with transparent operations, automated execution, and real-time monitoring throughout the process.",
  },
  {
    question: "What happens to my existing tokens?",
    answer:
      "Your existing tokens are mapped to the new contract at a 1:1 ratio. We handle all technical aspects while you maintain full control over your project.",
  },
  {
    question: "Can you handle cross-chain migrations?",
    answer:
      "Yes. We specialize in cross-chain migrations including bridges to Ethereum, Polygon, Arbitrum, Optimism, and other major chains.",
  },
  {
    question: "How much does a migration cost?",
    answer:
      "Pricing varies based on token complexity and community size. We provide custom quotes after the initial assessment. Request a consultation to discuss your specific needs.",
  },
  {
    question: "Do you provide post-migration support?",
    answer:
      "Absolutely. We offer 6 months of post-migration support including community updates, holder assistance, and monitoring.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <main className="min-h-screen bg-black text-white relative py-24 px-4">
      {/* Background effects - matches your main page style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            Everything you need to know about token migrations with w3Swap.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="glass-card p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold pr-4 text-white">{item.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-cyan-500 flex-shrink-0 transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-slate-700"
                      >
                        <p className="text-slate-400 leading-relaxed">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Card className="glass-card p-8">
            <CardContent className="p-0">
              <p className="text-slate-400 mb-4">Still have questions?</p>
              <Link href="/w3swap/contact">
                <Button className="btn-brand">
                  Contact Our Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}


