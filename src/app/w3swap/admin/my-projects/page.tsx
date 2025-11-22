'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Edit } from 'lucide-react';
import { useProjects, UiProject } from '@/lib/w3swap/api';
import { useWalletUi } from '@wallet-ui/react';

export default function MyProjectsPage() {
  const { account } = useWalletUi();
  const { data: projects, isLoading, error } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  const mine = useMemo(() => {
    const me = account?.address;
    const rows: UiProject[] = (projects || []);
    return rows.filter((p) => (!me ? false : p.projectAdmin === me))
      .filter((p) => searchTerm === '' || String(p.projectId).includes(searchTerm));
  }, [projects, account?.address, searchTerm]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="mt-2 text-slate-400">Projects created by your admin wallet</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by numeric project id..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="p-6 text-slate-400">Loading…</div>
      ) : error ? (
        <Card className="glass-card text-center py-12">
          <CardContent>Error loading projects</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mine.map((project, index) => (
            <motion.div
              key={`${project.projectId}:${project.projectAdmin}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card relative hover:border-cyan-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-white">Project #{project.projectId}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {project.oldTokenMint.toString().slice(0, 8)}… → {project.newTokenMint.toString().slice(0, 8)}…
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 border-slate-700 hover:border-cyan-500">
                      <Link href={`/w3swap/admin/projects/${project.projectId}`}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 border-slate-700 hover:border-cyan-500">
                      <Link href={`/w3swap/admin/projects/${project.projectId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

