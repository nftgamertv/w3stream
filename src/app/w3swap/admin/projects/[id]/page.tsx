'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject, useProjectEvents, useProjectAnalytics } from '@/lib/w3swap/api';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const numericId = Number(params.id);
  const { data: project, isLoading } = useProject(numericId);
  const { data: events } = useProjectEvents(numericId);
  const { data: analytics } = useProjectAnalytics(numericId, 30);

  if (isLoading) return <div className="p-6 text-slate-400">Loading…</div>;
  if (!project) return <div className="p-6 text-red-400">Project not found.</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
          Project #{numericId}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Analytics (30d)</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Total Migrated</div>
              <div className="font-semibold text-cyan-400">{analytics?.total_migrated ?? 0}</div>
            </div>
            <div>
              <div className="text-slate-400">Total Users</div>
              <div className="font-semibold text-purple-400">{analytics?.total_users ?? 0}</div>
            </div>
            <div>
              <div className="text-slate-400">Events</div>
              <div className="font-semibold text-teal-400">{analytics ? Object.values(analytics.event_counts || {}).reduce((a: any,b: any)=> (a as number) + (b as number), 0) : 0}</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Project #{numericId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-slate-400">Status: <span className="font-semibold text-white">{project.status}</span></div>
            <div className="text-slate-400">Old Mint: <span className="font-mono text-white">{project.oldTokenMint.toString()}</span></div>
            <div className="text-slate-400">New Mint: <span className="font-mono text-white">{project.newTokenMint.toString()}</span></div>
            <div className="text-slate-400">Totals: migrated <span className="text-white">{project.totalMigrated ?? 0}</span>, users <span className="text-white">{project.totalUsers ?? 0}</span></div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(events || []).slice(0, 20).map((e: any, idx: number) => (
              <div key={idx} className="text-xs border-b border-slate-800 pb-2">
                <div className="font-semibold text-white">{e.event_name}</div>
                <div className="text-slate-400">{e.created_at}</div>
              </div>
            ))}
            {(!events || events.length === 0) && <div className="text-xs text-slate-400">No events yet.</div>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

