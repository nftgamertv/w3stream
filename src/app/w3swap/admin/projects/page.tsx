'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  ArrowRight,
  Clock,
  Users,
  Coins,
  TrendingUp,
  Eye,
  Edit,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useProjects, UiProject } from '@/lib/w3swap/api';
import { useWalletUi } from '@wallet-ui/react';
import { useIsPlatformAdmin } from '@/lib/w3swap/roles';

const statusConfig = {
  Created: { label: 'Created', color: 'yellow' },
  Active: { label: 'Active', color: 'green' },
  Completed: { label: 'Completed', color: 'slate' },
  Cancelled: { label: 'Cancelled', color: 'red' },
};

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mineOnly, setMineOnly] = useState<boolean>(false);
  const { account } = useWalletUi();
  const { isAdmin: isPlatformAdmin } = useIsPlatformAdmin();
  
  const { data: projects, isLoading, error } = useProjects();

  const filteredProjects = (projects || []).filter((project: UiProject) => {
    const matchesSearch = searchTerm === '' || 
      String(project.projectId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesMine = !mineOnly || (account?.address && project.projectAdmin === account.address);
    
    return matchesSearch && matchesStatus && matchesMine;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="mt-2 text-slate-400">
            Manage all your token migration projects
          </p>
        </div>
        <Button asChild className="btn-brand">
          <Link href="/w3swap/admin/projects/create">
            Create Project
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'Active', 'Created', 'Completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'btn-brand' : 'border-slate-700 hover:border-cyan-500'}
                  >
                    {status === 'all' ? 'All' : status}
                  </Button>
                ))}
              </div>
              {isPlatformAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant={!mineOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMineOnly(false)}
                    className={!mineOnly ? 'btn-brand' : 'border-slate-700 hover:border-cyan-500'}
                  >
                    All Projects
                  </Button>
                  <Button
                    variant={mineOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMineOnly(true)}
                    className={mineOnly ? 'btn-brand' : 'border-slate-700 hover:border-cyan-500'}
                  >
                    My Projects
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading projects...</p>
        </div>
      ) : error ? (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <p className="text-red-400 mb-4">Error loading projects</p>
            <Button onClick={() => window.location.reload()} className="btn-brand">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: UiProject, index: number) => {
            const status: any = (statusConfig as any)[project.status] || { label: project.status, color: 'slate' };
            const isMine = !!account?.address && project.projectAdmin === account.address;
            
            return (
              <motion.div
                key={`${project.projectId}:${project.projectAdmin}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card relative overflow-hidden hover:border-cyan-500/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl text-white">
                          Project #{String(project.projectId)}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {project.oldTokenMint.toString().slice(0, 8)}... → {project.newTokenMint.toString().slice(0, 8)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {isMine && (
                          <Badge className="bg-slate-900/50 text-slate-300 border-slate-700">You are admin</Badge>
                        )}
                        <Badge className={
                          status.color === 'green' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          status.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          status.color === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-slate-900/50 text-slate-300 border-slate-700'
                        }>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Total Migrated</p>
                        <p className="font-semibold text-white">{(project.totalMigrated || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Users</p>
                        <p className="font-semibold text-white">{project.totalUsers || 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Exchange Rate</p>
                        <p className="font-semibold text-white">{project.exchangeRateOld ?? 0}:{project.exchangeRateNew ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Created</p>
                        <p className="font-semibold text-white">
                          {project.createdAt ? new Date(project.createdAt * 1000).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 border-slate-700 hover:border-cyan-500">
                        <Link href={`/w3swap/admin/projects/${project.projectId}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 border-slate-700 hover:border-cyan-500">
                        <Link href={`/w3swap/admin/projects/${project.projectId}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      {project.status === 'Created' && (
                        <Button size="sm" className="btn-brand">
                          <Play className="mr-2 h-4 w-4" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && !isLoading && (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <p className="text-slate-400 mb-4">
              No projects found matching your criteria
            </p>
            <Button asChild className="btn-brand">
              <Link href="/w3swap/admin/projects/create">
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

