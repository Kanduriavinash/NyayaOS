"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, CheckCircle2, Calendar, 
  User, RefreshCw, Gavel, Award, Plus, CalendarDays
} from 'lucide-react';
import { 
  getJudges, getJudgeCases, allocateHearing, issueCourtOrder 
} from './actions';

interface Citizen {
  name: string;
}

interface CaseDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string | null;
}

interface CaseHearing {
  id: string;
  date: string;
  room: string;
  status: string;
}

interface CaseOrder {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  citizen: Citizen;
  lawyer: Citizen | null;
  documents: CaseDoc[];
  hearings: CaseHearing[];
  orders: CaseOrder[];
  judgeId: string | null;
}

export default function JudgeDashboard() {
  const [judges, setJudges] = useState<any[]>([]);
  const [activeJudge, setActiveJudge] = useState<any | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Hearing Scheduler States
  const [hearingDate, setHearingDate] = useState('2026-07-20T10:00');
  const [hearingRoom, setHearingRoom] = useState('Courtroom A');
  const [scheduling, setScheduling] = useState(false);

  // Order Issuer States
  const [orderTitle, setOrderTitle] = useState('ORDER FOR TEMPORARY INJUNCTION');
  const [orderContent, setOrderContent] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const judgeList = await getJudges();
      setJudges(judgeList);
      if (judgeList.length > 0) {
        setActiveJudge(judgeList[0]);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (activeJudge) {
      refreshCases();
    }
  }, [activeJudge]);

  async function refreshCases() {
    if (!activeJudge) return;
    const caseList = (await getJudgeCases(activeJudge.id)) as Case[];
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

  async function handleScheduleHearing(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCase || !activeJudge || scheduling) return;
    setScheduling(true);
    try {
      await allocateHearing({
        caseId: selectedCase.id,
        judgeId: activeJudge.id,
        dateStr: hearingDate,
        room: hearingRoom
      });
      refreshCases();
    } catch (e) {
      console.error(e);
    } finally {
      setScheduling(false);
    }
  }

  async function handleIssueOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCase || !activeJudge || !orderContent || issuing) return;
    setIssuing(true);
    try {
      await issueCourtOrder({
        caseId: selectedCase.id,
        judgeId: activeJudge.id,
        title: orderTitle,
        content: orderContent
      });
      setOrderContent('');
      refreshCases();
    } catch (e) {
      console.error(e);
    } finally {
      setIssuing(false);
    }
  }

  const handleSelectOrderTemplate = (type: string) => {
    if (!selectedCase) return;
    if (type === 'STAY') {
      setOrderTitle('ORDER FOR TEMPORARY STAY OF DISPOSSESSION');
      setOrderContent(
        `UPON hearing the counsel for plaintiff, it is hereby ordered:\n` +
        `1. The defendants, their agents, and servants are restrained from interfering with the peaceful possession of the suit property located at Survey 443.\n` +
        `2. This ad-interim stay order shall remain in effect until the next date of hearing.\n` +
        `SO ORDERED.`
      );
    } else {
      setOrderTitle('FINAL JUDGMENT & SUMMONS DECREE');
      setOrderContent(
        `IN THE COURT OF THE DISTRICT JUDGE\n` +
        `Decree ordered in favor of Complainant/Citizen:\n` +
        `- Respondent is directed to pay refund of INR ${selectedCase.description.includes('500') ? '5,00,000' : '20,000'} along with interest at 9% p.a.\n` +
        `- Legal cost of INR 10,000 awarded.\n` +
        `Given under my hand and seal of the court.`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SCHEDULED': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
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
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">NyayaOS</span>
              <span className="text-xs text-slate-400 ml-2 font-mono border-l border-slate-700 pl-2">Judge Chambers</span>
            </div>
          </div>

          {/* User selector */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-sm">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Active Judge:</span>
            <select 
              value={activeJudge?.id || ''} 
              onChange={(e) => setActiveJudge(judges.find(j => j.id === e.target.value) || null)}
              className="bg-transparent font-medium text-amber-300 border-none outline-none cursor-pointer focus:ring-0"
            >
              {judges.map(j => (
                <option key={j.id} value={j.id} className="bg-slate-900 text-slate-100">{j.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Cases Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-300">Docket Cases ({cases.length})</h2>
              <button onClick={refreshCases} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-2">
              {cases.map((c) => {
                const isAssigned = c.judgeId === activeJudge?.id;
                return (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`border p-4 rounded-xl cursor-pointer hover:bg-slate-900/60 transition-all ${
                      selectedCase?.id === c.id 
                        ? 'border-amber-500/40 bg-slate-900/80 shadow-md' 
                        : 'border-slate-850 bg-slate-900/20'
                    }`}
                  >
                    <h3 className="font-semibold text-slate-200 line-clamp-1">{c.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">ID: {c.id.substring(0, 8)}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                        isAssigned ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isAssigned ? 'Assigned' : 'Approved Registry'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Case Docket Details */}
          {selectedCase ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Case Summary Brief */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-100">{selectedCase.title}</h1>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span>Citizen: {selectedCase.citizen.name}</span>
                      <span>•</span>
                      <span>Lawyer: {selectedCase.lawyer?.name || 'Self Represented'}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-full ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-sm text-slate-350 leading-relaxed">
                  <h4 className="text-xs font-semibold text-slate-450 uppercase mb-1 tracking-wider">Statement of Facts</h4>
                  {selectedCase.description}
                </div>
              </div>

              {/* Hearing Scheduler & Order Issuer Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hearing Scheduler */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-violet-400" /> Courtroom Hearing Scheduler
                  </h3>
                  
                  <form onSubmit={handleScheduleHearing} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Courtroom Room</label>
                      <select
                        value={hearingRoom}
                        onChange={(e) => setHearingRoom(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs focus:border-amber-500 outline-none"
                      >
                        <option value="Courtroom A">Courtroom A (Main Civil Bench)</option>
                        <option value="Courtroom B">Courtroom B (Sub-divisional Bench)</option>
                        <option value="Chambers 1">Chambers 1 (Online Dispute Resolution)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Scheduled Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={hearingDate}
                        onChange={(e) => setHearingDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={scheduling}
                      className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-slate-950 font-bold py-2 rounded text-xs transition-all shadow-lg shadow-violet-500/10"
                    >
                      {scheduling ? 'Scheduling...' : 'Schedule Hearing'}
                    </button>
                  </form>
                </div>

                {/* Court Order Issuer */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" /> Issue Judicial Court Order
                  </h3>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSelectOrderTemplate('STAY')}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold px-2 py-1 rounded text-[10px] transition-colors"
                    >
                      Stay Order Template
                    </button>
                    <button 
                      onClick={() => handleSelectOrderTemplate('FINAL')}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold px-2 py-1 rounded text-[10px] transition-colors"
                    >
                      Final decree Template
                    </button>
                  </div>
                  
                  <form onSubmit={handleIssueOrder} className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        value={orderTitle}
                        onChange={(e) => setOrderTitle(e.target.value)}
                        placeholder="Order Title"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <textarea 
                        value={orderContent}
                        onChange={(e) => setOrderContent(e.target.value)}
                        placeholder="Type the formal injunction stays or decree orders..."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xs focus:border-amber-500 outline-none font-mono"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={issuing}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-2 rounded text-xs transition-all shadow-lg shadow-emerald-500/10"
                    >
                      {issuing ? 'Issuing...' : 'Issue Court Order'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Case Files Checklist & Documents */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" /> Docket Files & Previous Orders
                </h3>

                <div className="space-y-4 pt-2">
                  {/* Hearings Feed */}
                  {selectedCase.hearings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Hearings</h4>
                      {selectedCase.hearings.map(h => (
                        <div key={h.id} className="bg-slate-950 p-3 border border-slate-850 rounded-lg flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-350">{new Date(h.date).toLocaleString()}</span>
                          <span>Room: {h.room}</span>
                          <span className="text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">{h.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Orders Feed */}
                  {selectedCase.orders.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issued Judicial Orders</h4>
                      {selectedCase.orders.map(o => (
                        <div key={o.id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-amber-300">{o.title}</span>
                            <span className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono whitespace-pre-wrap">{o.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plaint Documents */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Docket Documents</h4>
                    {selectedCase.documents.map(d => (
                      <div key={d.id} className="bg-slate-950 p-3 border border-slate-850 rounded-lg text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-300">{d.name}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-500">{d.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono line-clamp-2 hover:line-clamp-none transition-all">{d.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-20 text-slate-500 text-center space-y-4">
              <Scale className="w-12 h-12 text-slate-650" />
              <div>
                <h3 className="font-semibold text-slate-300">No Case Selected</h3>
                <p className="text-sm mt-1 max-w-sm">Select an active case from the docket list on the left to start judicial allocation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
