
import React from 'react';
import { Paper, ClusterInsight } from '../types';

interface SidebarProps {
  selectedPaper: Paper | null;
  selectedCluster: number | null;
  insight: ClusterInsight | null;
  isLoadingInsight: boolean;
  onGenerateInsight: () => void;
  searchTopic: string;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedPaper, selectedCluster, insight, isLoadingInsight, onGenerateInsight, searchTopic }) => {
  if (!selectedPaper && selectedCluster === null) {
    return (
      <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-slate-300 font-medium mb-2">Discovery Explorer</h3>
        <p className="text-slate-500 text-sm">Select a paper to view its abstract or a cluster to generate a literature review narrative.</p>
      </div>
    );
  }

  const arxivDirectLink = selectedPaper?.arxivId && selectedPaper.arxivId !== 'null' 
    ? `https://arxiv.org/abs/${selectedPaper.arxivId}` 
    : null;
  
  const arxivSearchLink = selectedPaper 
    ? `https://arxiv.org/search/?query=${encodeURIComponent(selectedPaper.title)}&searchtype=title` 
    : '#';

  const scholarLink = selectedPaper 
    ? `https://scholar.google.com/scholar?q=${encodeURIComponent(selectedPaper.title)}` 
    : '#';

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {selectedPaper && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">Paper Details</span>
               {selectedPaper.isBridge && <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase tracking-wider">Bridge Paper</span>}
            </div>
            <h2 className="text-xl font-bold leading-tight mb-2">{selectedPaper.title}</h2>
            <div className="text-slate-400 text-sm mb-4">
              <span className="font-medium text-slate-300">{selectedPaper.authors.join(", ")}</span>
              <span className="mx-2">•</span>
              <span>{selectedPaper.year}</span>
            </div>

            {/* Relevance Statement - NEW ASPECT */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">Contextual Relevance</span>
              </div>
              <p className="text-slate-200 text-xs italic leading-relaxed">
                "{selectedPaper.relevanceStatement}"
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300">
                  <span className="text-slate-500 font-sans font-bold">arXiv:</span>
                  {selectedPaper.arxivId || 'N/A'}
                </div>
                {arxivDirectLink && (
                  <a 
                    href={arxivDirectLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                  >
                    Direct
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
              </div>
              
              <div className="flex gap-2">
                <a 
                  href={arxivSearchLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-bold transition-all"
                >
                  Find on ArXiv
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </a>
                <a 
                  href={scholarLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-bold transition-all"
                >
                  Google Scholar
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </a>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Abstract</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{selectedPaper.abstract}</p>
          </div>
        )}

        {selectedCluster !== null && selectedCluster !== -1 && (
          <div className="border-t border-slate-800 pt-6 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cluster {selectedCluster + 1} Insights</h4>
            {!insight ? (
              <button
                onClick={onGenerateInsight}
                disabled={isLoadingInsight}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
              >
                {isLoadingInsight ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a1 1 0 001 1h4" />
                    </svg>
                    Generate Subsection
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <h5 className="text-indigo-400 font-bold text-sm mb-1 italic">Suggested Title</h5>
                  <p className="text-white font-medium">{insight.title}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Narrative Prompt</h5>
                  <div className="prose prose-invert prose-sm">
                    {insight.narrative.split('\n\n').map((para, i) => (
                      <p key={i} className="text-slate-300 leading-relaxed mb-4">{para}</p>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={onGenerateInsight}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                >
                  Regenerate Narrative
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          GEMINI SEARCH GROUNDING ACTIVE
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
