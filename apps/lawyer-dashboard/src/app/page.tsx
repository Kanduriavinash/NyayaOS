"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, Briefcase, FileText, CheckCircle2, AlertCircle, 
  BookOpen, Sparkles, Send, Gavel, User, RefreshCw
} from 'lucide-react';
import { 
  getLawyers, getLawyerCases, claimCase, 
  draftAIPetition, submitPetition 
} from './actions';

interface Citizen {
  name: string;
  email: string;
}

interface CaseDoc {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  citizenId: string;
  citizen: Citizen;
  lawyerId: string | null;
  documents: CaseDoc[];
}

export default function LawyerDashboard() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [activeLawyer, setActiveLawyer] = useState<any | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // AI draft states
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      const lawyerList = await getLawyers();
      setLawyers(lawyerList);
      if (lawyerList.length > 0) {
        setActiveLawyer(lawyerList[0]);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (activeLawyer) {
      refreshCases();
    }
  }, [activeLawyer]);

  async function refreshCases() {
    if (!activeLawyer) return;
    const caseList = (await getLawyerCases(activeLawyer.id)) as Case[];
    setCases(caseList);
    
    if (caseList.length > 0) {
      // Retain or select case
      const currentSelected = selectedCase 
        ? caseList.find(x => x.id === selectedCase.id) 
        : caseList[0];
      setSelectedCase(currentSelected || caseList[0]);
    } else {
      setSelectedCase(null);
    }
  }

  async function handleClaimCase(caseId: string) {
    if (!activeLawyer) return;
    await claimCase(caseId, activeLawyer.id);
    refreshCases();
  }

  async function handleGenerateDraft() {
    if (!selectedCase) return;
    setDrafting(true);
    try {
      const res = await draftAIPetition(selectedCase.id);
      setDraftTitle(res.title);
      setDraftContent(res.content);
    } catch (e) {
      console.error(e);
    } finally {
      setDrafting(false);
    }
  }

  async function handleSubmitPetition() {
    if (!selectedCase || !activeLawyer || !draftTitle || !draftContent) return;
    setSubmitting(true);
    try {
      await submitPetition(selectedCase.id, draftTitle, draftContent, activeLawyer.id);
      setDraftTitle('');
      setDraftContent('');
      refreshCases();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  // Simulated legal research suggestions
  const getResearchSuggestions = (category: string) => {
    if (category === 'PROPERTY_DISPUTE') {
      return {
        statutes: [
          { act: 'Specific Relief Act, 1963', section: 'Section 5 & 6', desc: 'Provides speedy recovery of dispossessed immovable property.' },
          { act: 'Transfer of Property Act, 1882', section: 'Section 54', desc: 'Governs requirements of valid registered title sale deeds.' }
        ],
        precedents: [
          { citation: '2023 INSC 445 (Anitha v. Ramasamy)', summary: 'Title cannot be created without registered conveyance deed.' },
          { citation: '2021 INSC 812 (Haryana v. Mukesh)', summary: 'Clarified restrictions on acquiring title via adverse possession.' }
        ]
      };
    } else {
      return {
        statutes: [
          { act: 'Consumer Protection Act, 2019', section: 'Section 2(11)', desc: 'Defines deficiency in services and goods defects.' },
          { act: 'Consumer Protection Act, 2019', section: 'Section 35', desc: 'Lays down rules for complaint filings.' }
        ],
        precedents: [
          { citation: '2023 INSC 112 (State Bank v. Consumer)', summary: 'Banks liable for server transaction failures under services deficiency.' }
        ]
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_INTAKE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'VERIFYING_IDENTITY': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'VERIFYING_DOCS': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'PENDING_PETITION': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PENDING_REGISTRY': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SCHEDULED': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
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
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">NyayaOS</span>
              <span className="text-xs text-slate-400 ml-2 font-mono border-l border-slate-700 pl-2">Lawyer Workspace</span>
            </div>
          </div>

          {/* User selector */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-sm">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Active Lawyer:</span>
            <select 
              value={activeLawyer?.id || ''} 
              onChange={(e) => setActiveLawyer(lawyers.find(l => l.id === e.target.value) || null)}
              className="bg-transparent font-medium text-amber-300 border-none outline-none cursor-pointer focus:ring-0"
            >
              {lawyers.map(l => (
                <option key={l.id} value={l.id} className="bg-slate-900 text-slate-100">{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Case List Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-300">Monitored Cases ({cases.length})</h2>
              <button onClick={refreshCases} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-2">
              {cases.map((c) => {
                const isClaimed = c.lawyerId === activeLawyer?.id;
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
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-500">Citizen: {c.citizen.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${
                        isClaimed ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isClaimed ? 'Claimed' : 'Unclaimed'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      {!isClaimed && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimCase(c.id);
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded text-[10px] transition-colors"
                        >
                          Claim Case
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Case Details Workspace */}
          {selectedCase ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Case Brief Header */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-100">{selectedCase.title}</h1>
                    <span className="text-[10px] text-slate-500 font-mono">Case ID: {selectedCase.id}</span>
                  </div>
                  <span className={`text-xs font-bold border px-3 py-1 rounded-full ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-lg text-sm text-slate-350 leading-relaxed">
                  <h4 className="text-xs font-semibold text-slate-450 uppercase mb-1 tracking-wider">Citizen Narrative Statement</h4>
                  {selectedCase.description}
                </div>
              </div>

              {/* AI Petition Generator */}
              {selectedCase.lawyerId === activeLawyer?.id && (
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-6 shadow-xl">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> AI-Assisted Plaint / Petition Draftsman
                  </h3>

                  {draftContent ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Draft Petition Title</label>
                        <input 
                          type="text" 
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:border-amber-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Petition Content Draft</label>
                        <textarea 
                          value={draftContent}
                          onChange={(e) => setDraftContent(e.target.value)}
                          rows={10}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs focus:border-amber-500 outline-none font-mono leading-relaxed"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleGenerateDraft}
                          className="flex-1 bg-slate-800 hover:bg-slate-750 text-amber-300 font-semibold py-2.5 rounded text-xs transition-colors"
                        >
                          Regenerate Draft
                        </button>
                        <button
                          onClick={handleSubmitPetition}
                          disabled={submitting}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-2.5 rounded text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10"
                        >
                          <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit to Court Registry'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-lg p-10 text-center space-y-4">
                      <FileText className="w-10 h-10 text-slate-650 mx-auto" />
                      <div className="max-w-xs mx-auto">
                        <p className="text-xs text-slate-500">Auto-generate a complete formal civil plaint using verified judicial templates.</p>
                      </div>
                      <button
                        onClick={handleGenerateDraft}
                        disabled={drafting}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-4 py-2 rounded text-xs border border-amber-500/20 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" /> {drafting ? 'Analyzing Facts...' : 'Draft Petition Plaint'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Legal Research Recommendations */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" /> AI Case Law & Precedent Recommendations
                </h3>
                <p className="text-xs text-slate-400">
                  Retrieving relevant statutes and judicial precedents matching this case category.
                </p>

                {(() => {
                  const research = getResearchSuggestions(selectedCase.category);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">Applicable Acts</h4>
                        {research.statutes.map((s, idx) => (
                          <div key={idx} className="bg-slate-950 p-3 border border-slate-850 rounded-lg">
                            <span className="text-xs font-semibold text-amber-300">{s.act} - {s.section}</span>
                            <p className="text-[11px] text-slate-400 mt-1">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">Governing Precedents</h4>
                        {research.precedents.map((p, idx) => (
                          <div key={idx} className="bg-slate-950 p-3 border border-slate-850 rounded-lg">
                            <span className="text-xs font-semibold text-indigo-300">{p.citation}</span>
                            <p className="text-[11px] text-slate-400 mt-1">{p.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-20 text-slate-500 text-center space-y-4">
              <Scale className="w-12 h-12 text-slate-650" />
              <div>
                <h3 className="font-semibold text-slate-300">No Case Selected</h3>
                <p className="text-sm mt-1 max-w-sm">Select a case from the list on the left to start claiming, reviewing recommendations, and drafting the petition.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
