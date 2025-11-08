"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function W3swapHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <section className="relative overflow-hidden py-12 px-4 bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center pt-12 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <Badge className="mb-8 glass-card border-slate-700 px-4 py-2">
            <Sparkles className="w-4 h-4 text-cyan-500 mr-2" />
            <span className="text-sm font-medium text-slate-400">Trusted by Web3 projects</span>
          </Badge>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent mb-6"
        >
          Token Migration Made Simple
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          w3Swap provides secure, transparent, and efficient token migration solutions for blockchain projects. Move
          your tokens with confidence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/w3swap/contact">
            <Button className="btn-brand inline-flex items-center gap-2 group">
              Start Your Migration
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/w3swap/about">
            <Button variant="outline" className="border-slate-700 text-cyan-500 hover:border-cyan-500/80">
              Learn More
            </Button>
          </Link>
        </motion.div>

        {/* Stats - Commented out until we have real metrics */}
        {/* 
        <motion.div variants={itemVariants} className="mt-12 grid grid-cols-3 gap-8 pt-12 border-t border-slate-800">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-cyan-500 mb-2">50+</div>
            <p className="text-sm text-slate-400">Projects Migrated</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2">$2B+</div>
            <p className="text-sm text-slate-400">Tokens Migrated</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-teal-500 mb-2">100%</div>
            <p className="text-sm text-slate-400">Security Record</p>
          </div>
        </motion.div>
        */}

        {/* Pre-launch value propositions */}
        <motion.div variants={itemVariants} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-12 border-t border-slate-800">
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-500 mb-2">Secure</div>
            <p className="text-xs sm:text-sm text-slate-400">Migration Process</p>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-500 mb-2">Transparent</div>
            <p className="text-xs sm:text-sm text-slate-400">Operations</p>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-500 mb-2">Decentralized</div>
            <p className="text-xs sm:text-sm text-slate-400">Infrastructure</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}


