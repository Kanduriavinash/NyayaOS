"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, CheckCircle2, User, RefreshCw, 
  Settings, ShieldAlert, BarChart3, Database, Users, History
} from 'lucide-react';
import { getAdminStats, getAuditLogs, getUsers } from './actions';

interface Stats {
  casesByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  totalCases: number;
  totalUsers: number;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: Date;
  user: {
    name: string;
    role: string;
  } | null;
}

interface UserRecord {
  id: string;
  name: string;
  role: string;
  email: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    casesByStatus: {},
    usersByRole: {},
    totalCases: 0,
    totalUsers: 0
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const adminStats = await getAdminStats();
    const logs = await getAuditLogs();
    const systemUsers = await getUsers();

    setStats(adminStats);
    setAuditLogs(logs.map(l => ({ ...l, createdAt: new Date(l.createdAt) })));
    setUsers(systemUsers);
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'JUDGE': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'LAWYER': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REGISTRY': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg text-slate-950 shadow-lg shadow-amber-500/10">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">NyayaOS</span>
              <span className="text-xs text-slate-400 ml-2 font-mono border-l border-slate-700 pl-2">System Admin Console</span>
            </div>
          </div>

          <button 
            onClick={refreshData}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Filed Cases</span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.totalCases}</h2>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Scale className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Citizens</span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.usersByRole['CITIZEN'] || 0}</h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Enrolled Lawyers</span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.usersByRole['LAWYER'] || 0}</h2>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Judges Bench</span>
              <h2 className="text-3xl font-extrabold text-slate-100 mt-2">{stats.usersByRole['JUDGE'] || 0}</h2>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Case Status Distribution */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Case Flow Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Visualizing the active status distribution of lawsuits filed on NyayaOS.
            </p>

            <div className="space-y-3 pt-2">
              {Object.entries(stats.casesByStatus).map(([status, count]) => {
                const percentage = stats.totalCases > 0 ? (count / stats.totalCases) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-350">
                      <span className="uppercase text-[10px] tracking-wide font-semibold text-slate-450">{getStatusText(status)}</span>
                      <span>{count} cases ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}

              {Object.keys(stats.casesByStatus).length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-850 rounded">
                  No case distribution records found.
                </div>
              )}
            </div>
          </div>

          {/* Database System Users */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" /> Registered System Users ({stats.totalUsers})
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-450 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 pr-2">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/20">
                      <td className="py-2.5 pl-2 font-medium text-slate-200">{u.name}</td>
                      <td className="py-2.5 text-slate-400 font-mono">{u.email}</td>
                      <td className="py-2.5 pr-2">
                        <span className={`text-[9px] border font-bold px-2 py-0.5 rounded-full ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Audit Log Feed */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> System Action Audit Ledger
          </h3>
          <p className="text-xs text-slate-400">
            Real-time chronological trace of administrative and user transactions executing within the courthouse databases.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-450 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Timestamp</th>
                  <th className="pb-3">Trigger User</th>
                  <th className="pb-3">Action Code</th>
                  <th className="pb-3 pr-2">Transaction Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/20">
                    <td className="py-3 pl-2 text-slate-500 whitespace-nowrap">{log.createdAt.toLocaleString()}</td>
                    <td className="py-3 text-slate-300 whitespace-nowrap">{log.user?.name || 'SYSTEM'}</td>
                    <td className="py-3 text-amber-400 whitespace-nowrap font-bold">{log.action}</td>
                    <td className="py-3 pr-2 text-slate-400 max-w-md line-clamp-1 hover:line-clamp-none transition-all">{log.details}</td>
                  </tr>
                ))}

                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-850 rounded">
                      No audit trails recorded. Run transactions from other portals first!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
