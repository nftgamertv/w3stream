'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
          Platform Settings
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400">
            This page is restricted to platform admins. Integrate PlatformConfig editors here (fee destination, allowed swap programs, thresholds, etc.).
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

