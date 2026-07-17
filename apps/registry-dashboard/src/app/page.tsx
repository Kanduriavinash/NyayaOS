"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, CheckCircle2, AlertCircle, 
  Check, X, User, RefreshCw, ClipboardCheck
} from 'lucide-react';
import { getRegistryCases, approveFiling, rejectFiling } from './actions';

interface Citizen {
  name: string;
  email: string;
}

interface CaseDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string | null;
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  citizenId: string;
  citizen: Citizen;
  lawyer: Citizen | null;
  documents: CaseDoc[];
}

export default function RegistryDashboard() {
  const [officerId, setOfficerId] = useState('97637800-60ca-4f1d-97a9-36d424443275'); // Sunita Sharma ID
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    refreshCases();
  }, []);

  async function refreshCases() {
    const caseList = (await getRegistryCases()) as Case[];
    setCases(caseList);
    
    if (caseList.length > 0) {
      const currentSelected = selectedCase 
        ? caseList.find(x => x.id === selectedCase.id) 
        : caseList[0];
      setSelectedCase(currentSelected || caseList[0]);
    } else {
      setSelectedCase(null);
    }
  }

  async function handleApprove() {
    if (!selectedCase || processing) return;
    setProcessing(true);
    try {
      await approveFiling(selectedCase.id, officerId);
      refreshCases();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCase || !rejectionReason || processing) return;
    setProcessing(true);
    try {
      await rejectFiling(selectedCase.id, officerId, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
      refreshCases();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REGISTRY': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg text-slate-950 shadow-lg shadow-amber-500/10">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">NyayaOS</span>
              <span className="text-xs text-slate-400 ml-2 font-mono border-l border-slate-700 pl-2">Court Registry Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-sm">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Registry Officer:</span>
            <span className="font-medium text-amber-300">Sunita Sharma</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Cases List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-300">Filing Queue ({cases.filter(x => x.status === 'PENDING_REGISTRY').length} Pending)</h2>
              <button onClick={refreshCases} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-2">
              {cases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    setShowRejectForm(false);
                  }}
                  className={`border p-4 rounded-xl cursor-pointer hover:bg-slate-900/60 transition-all ${
                    selectedCase?.id === c.id 
                      ? 'border-amber-500/40 bg-slate-900/80 shadow-md' 
                      : 'border-slate-850 bg-slate-900/20'
                  }`}
                >
                  <h3 className="font-semibold text-slate-200 line-clamp-1">{c.title}</h3>
                  <div className="mt-2 text-xs text-slate-400 flex justify-between">
                    <span>Citizen: {c.citizen.name}</span>
                    <span>Lawyer: {c.lawyer?.name || 'Self Represented'}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {c.id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Case Details View */}
          {selectedCase ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Case Summary */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-100">{selectedCase.title}</h1>
                    <span className="text-xs text-slate-500">Category: {selectedCase.category}</span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-full ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-sm text-slate-350 leading-relaxed">
                  <h4 className="text-xs font-semibold text-slate-450 uppercase mb-1 tracking-wider">Statement of Claim</h4>
                  {selectedCase.description}
                </div>

                {/* Validation Actions */}
                {selectedCase.status === 'PENDING_REGISTRY' && !showRejectForm && (
                  <div className="flex gap-4 border-t border-slate-800 pt-4">
                    <button 
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 rounded-lg border border-rose-500/20 flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-4 h-4" /> Reject Filing
                    </button>
                    <button 
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-lg shadow-emerald-500/10"
                    >
                      <Check className="w-4 h-4" /> Approve & Issue Summons
                    </button>
                  </div>
                )}

                {showRejectForm && (
                  <form onSubmit={handleReject} className="border-t border-slate-800 pt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-450 uppercase mb-1.5">Registry Rejection Reason</label>
                      <input 
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Missing valid property conveyance deed signature block"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-400 font-semibold py-2 rounded text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold py-2 rounded text-xs transition-colors"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Case Documents Checklist */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" /> Uploaded Document Audit Panel
                </h3>
                <p className="text-xs text-slate-400">
                  Verify if the pliant petition and citizen ID records satisfy governing checklists.
                </p>

                <div className="space-y-4 pt-2">
                  {selectedCase.documents.map((doc) => (
                    <div key={doc.id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-xs text-slate-300">{doc.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono ml-2 uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{doc.type}</span>
                        </div>
                        <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${
                          doc.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          doc.status === 'INVALID' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap bg-slate-900/60 p-2.5 border border-slate-850 rounded">{doc.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-20 text-slate-500 text-center space-y-4">
              <Scale className="w-12 h-12 text-slate-650" />
              <div>
                <h3 className="font-semibold text-slate-300">No Case Selected</h3>
                <p className="text-sm mt-1 max-w-sm">Select a pending filing from the queue to start registry validation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
