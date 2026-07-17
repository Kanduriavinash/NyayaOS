"use client";

import React, { useState, useEffect, startTransition } from 'react';
import { 
  Scale, FileText, CheckCircle2, AlertCircle, Calendar, 
  User, Clock, ArrowRight, UploadCloud, ShieldCheck, 
  Plus, RefreshCw, Gavel, HelpCircle
} from 'lucide-react';
import { 
  getCitizens, getCourts, getCases, createCase, 
  verifyUserIdentity, uploadMockDocument 
} from './actions';

interface Citizen {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface Court {
  id: string;
  name: string;
  location: string;
}

interface CaseDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string | null;
  createdAt: Date;
}

interface CaseHearing {
  id: string;
  date: Date;
  room: string;
  status: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  court: Court | null;
  documents: CaseDoc[];
  hearings: CaseHearing[];
  judge: { name: string } | null;
}

export default function CitizenPortal() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [activeCitizen, setActiveCitizen] = useState<Citizen | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PROPERTY_DISPUTE');
  const [claimAmount, setClaimAmount] = useState('500000');
  const [courtId, setCourtId] = useState('');

  // ID verification state
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [verifyingId, setVerifyingId] = useState(false);
  const [idVerifyResult, setIdVerifyResult] = useState<string | null>(null);

  // Document upload state
  const [docType, setDocType] = useState('ID_PROOF');
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'cases' | 'file'>('cases');

  useEffect(() => {
    // Initial fetch
    async function loadInitial() {
      const citizenList = await getCitizens();
      const courtList = await getCourts();
      setCitizens(citizenList);
      setCourts(courtList);
      
      if (citizenList.length > 0) {
        setActiveCitizen(citizenList[0]);
      }
      if (courtList.length > 0) {
        setCourtId(courtList[0].id);
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (activeCitizen) {
      refreshCases();
    }
  }, [activeCitizen]);

  async function refreshCases() {
    if (!activeCitizen) return;
    const caseList = await getCases(activeCitizen.id);
    // Map dates
    const formattedList = caseList.map(c => ({
      ...c,
      documents: c.documents.map(d => ({ ...d, createdAt: new Date(d.createdAt) })),
      hearings: c.hearings.map(h => ({ ...h, date: new Date(h.date) }))
    })) as Case[];
    setCases(formattedList);
    if (formattedList.length > 0) {
      // Keep selected case active or select the first one
      const currentSelected = selectedCase 
        ? formattedList.find(x => x.id === selectedCase.id) 
        : formattedList[0];
      setSelectedCase(currentSelected || formattedList[0]);
    } else {
      setSelectedCase(null);
    }
  }

  async function handleFileCase(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCitizen) return;
    
    await createCase({
      citizenId: activeCitizen.id,
      title,
      description,
      category,
      claimAmount: parseFloat(claimAmount),
      courtId
    });

    setTitle('');
    setDescription('');
    refreshCases();
    setActiveTab('cases');
  }

  async function handleVerifyIdentity() {
    if (!activeCitizen || !idNumber) return;
    setVerifyingId(true);
    setIdVerifyResult(null);
    try {
      const res = await verifyUserIdentity(activeCitizen.id, idType, idNumber);
      setIdVerifyResult(res.message);
      if (res.success) {
        setIdNumber('');
        refreshCases();
      }
    } catch (e: any) {
      setIdVerifyResult(e.message);
    } finally {
      setVerifyingId(false);
    }
  }

  async function handleUploadDoc() {
    if (!selectedCase || !docName || !docContent) return;
    setUploadingDoc(true);
    try {
      const res = await uploadMockDocument(selectedCase.id, docName, docType, docContent);
      if (res.success) {
        setDocName('');
        setDocContent('');
        refreshCases();
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setUploadingDoc(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_INTAKE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'VERIFYING_IDENTITY': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'VERIFYING_DOCS': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SCHEDULED': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const statusStages = [
    { key: 'PENDING_INTAKE', label: 'Intake Filed' },
    { key: 'VERIFYING_IDENTITY', label: 'Identity Check' },
    { key: 'VERIFYING_DOCS', label: 'Document Check' },
    { key: 'APPROVED', label: 'Filing Approved' },
    { key: 'SCHEDULED', label: 'Hearing Scheduled' }
  ];

  const getStageIndex = (status: string) => {
    if (status === 'REJECTED') return -1;
    return statusStages.findIndex(s => s.key === status);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg text-slate-950 shadow-lg shadow-amber-500/10">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">NyayaOS</span>
              <span className="text-xs text-slate-400 ml-2 font-mono border-l border-slate-700 pl-2">Citizen Portal</span>
            </div>
          </div>

          {/* User selector */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full text-sm">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Acting Citizen:</span>
            <select 
              value={activeCitizen?.id || ''} 
              onChange={(e) => setActiveCitizen(citizens.find(c => c.id === e.target.value) || null)}
              className="bg-transparent font-medium text-amber-300 border-none outline-none cursor-pointer focus:ring-0"
            >
              {citizens.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-8 gap-4">
          <button 
            onClick={() => setActiveTab('cases')}
            className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cases' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" /> My Active Cases
          </button>
          <button 
            onClick={() => setActiveTab('file')}
            className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'file' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" /> File New Petition
          </button>
        </div>

        {activeTab === 'file' ? (
          /* File New Petition Layout */
          <div className="max-w-2xl bg-slate-900 border border-slate-850 rounded-xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <FileText className="text-amber-400" /> Plaint Intake Submission Form
            </h2>

            <form onSubmit={handleFileCase} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Dispute Title / Subject</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Encroachment of land in Sector 12"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-amber-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Case Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-amber-500 focus:outline-none transition-colors"
                  >
                    <option value="PROPERTY_DISPUTE">Property Dispute</option>
                    <option value="CONSUMER_CASE">Consumer Complaint</option>
                    <option value="FAMILY_CASE">Family Dispute</option>
                    <option value="MEDIATION">Mediation Track</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Estimated Claim Value (INR)</label>
                  <input 
                    type="number" 
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-amber-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Preferred Court Jurisdiction</label>
                <select 
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-amber-500 focus:outline-none transition-colors"
                >
                  {courts.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name} ({ct.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Detailed Narrative Statement of Facts</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe in detail the events that occurred, dates, parties involved, and the specific relief you are seeking."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 focus:border-amber-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                File Case to NyayaOS <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          /* My Active Cases Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cases Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-300">Your Filed Cases ({cases.length})</h2>
                <button 
                  onClick={refreshCases}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title="Refresh cases list"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {cases.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
                  No cases found for this citizen. Use the "File New Petition" tab to create one!
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
                  {cases.map((c) => (
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
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-mono">{c.category.replace('_', ' ')}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {c.id.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Case Details Pane */}
            {selectedCase ? (
              <div className="lg:col-span-2 space-y-6">
                {/* Case Header Card */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-100">{selectedCase.title}</h1>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-400 font-semibold">{selectedCase.category}</span>
                        <span>•</span>
                        <span>Court: {selectedCase.court?.name || 'Assigned soon'}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold border px-3 py-1 rounded-full ${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-350 mt-4 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                    {selectedCase.description}
                  </p>

                  {/* Stepper Pipeline */}
                  <div className="mt-8 border-t border-slate-800 pt-6">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Verification Workflow Tracker</h4>
                    <div className="grid grid-cols-5 gap-2 relative">
                      {statusStages.map((stage, idx) => {
                        const activeIdx = getStageIndex(selectedCase.status);
                        const isCompleted = activeIdx >= idx;
                        const isCurrent = activeIdx === idx;
                        return (
                          <div key={stage.key} className="flex flex-col items-center text-center space-y-2">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                              isCompleted 
                                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' 
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-medium leading-tight ${isCurrent ? 'text-amber-400 font-semibold' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Identity & Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Identity Check Box */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> Identity Verification
                    </h3>
                    <p className="text-xs text-slate-400">
                      Submit document credentials to satisfy the intake identity check pipeline.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="flex gap-2">
                        <select 
                          value={idType} 
                          onChange={(e) => setIdType(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 outline-none"
                        >
                          <option value="aadhaar">Aadhaar</option>
                          <option value="passport">Passport</option>
                          <option value="pan">PAN</option>
                          <option value="voter_id">Voter ID</option>
                        </select>
                        <input 
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          placeholder="Document ID Number"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs focus:border-amber-500 outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleVerifyIdentity}
                        disabled={verifyingId}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-amber-300 font-semibold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        {verifyingId ? 'Verifying...' : 'Verify User ID'}
                      </button>

                      {idVerifyResult && (
                        <div className={`p-3 rounded text-[11px] flex items-center gap-2 border ${
                          idVerifyResult.toLowerCase().includes('verified') || idVerifyResult.toLowerCase().includes('success')
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {idVerifyResult.toLowerCase().includes('verified') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                          <span>{idVerifyResult}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Uploader Box */}
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-indigo-400" /> Upload Case Document
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs focus:border-amber-500 outline-none"
                        >
                          <option value="ID_PROOF">Identity Proof</option>
                          <option value="PROPERTY_DEED">Property Deed</option>
                          <option value="EVIDENCE">Case Evidence</option>
                          <option value="OTHER">Other</option>
                        </select>
                        <input
                          type="text"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          placeholder="e.g. sale_deed.pdf"
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs focus:border-amber-500 outline-none"
                        />
                      </div>
                      <textarea
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        placeholder="Simulate document content. Note: Mention 'Signature: Present' or similar facts so the document parser approves."
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 outline-none"
                      />
                      <button
                        onClick={handleUploadDoc}
                        disabled={uploadingDoc}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-indigo-300 font-semibold py-2 rounded text-xs transition-colors"
                      >
                        {uploadingDoc ? 'Uploading...' : 'Upload & Process Document'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Case Details Feed tabs (Docs, hearings, timeline) */}
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-400" /> Case Records & Documents ({selectedCase.documents.length})</h3>
                  
                  {selectedCase.documents.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-850 rounded">
                      No documents associated with this case yet. Upload some files above.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCase.documents.map((doc) => (
                        <div key={doc.id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-xs text-slate-300">{doc.name}</span>
                            <span className="text-[10px] text-slate-500 ml-3 bg-slate-900 px-2 py-0.5 rounded font-mono">{doc.type}</span>
                            <p className="text-[11px] text-slate-400 mt-2 font-mono whitespace-pre-wrap">{doc.content}</p>
                          </div>
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${
                            doc.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            doc.status === 'INVALID' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Scheduled Hearings */}
                  <h3 className="font-semibold text-slate-200 mt-8 mb-4 flex items-center gap-2"><Gavel className="w-5 h-5 text-violet-400" /> Scheduled Hearings ({selectedCase.hearings.length})</h3>
                  
                  {selectedCase.hearings.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-850 rounded">
                      No hearings scheduled yet. Hearings are automatically allocated by the registry.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCase.hearings.map((h) => (
                        <div key={h.id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-5 h-5 text-violet-400" />
                            <div>
                              <span className="font-bold text-xs text-slate-350">{h.date.toLocaleString()}</span>
                              <p className="text-[11px] text-slate-500 mt-0.5">Courtroom: {h.room} | Judge: {selectedCase.judge?.name || 'Justice Assignee'}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                            {h.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-20 text-slate-500 text-center space-y-4">
                <Scale className="w-12 h-12 text-slate-650" />
                <div>
                  <h3 className="font-semibold text-slate-300">No Case Selected</h3>
                  <p className="text-sm mt-1 max-w-sm">Select an active lawsuit from the left sidebar to view its documentation and verification status.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
