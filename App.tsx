
import React, { useState, useEffect, useMemo } from 'react';
import GraphView from './components/GraphView';
import Sidebar from './components/Sidebar';
import { generateRelatedWorkGraph, generateClusterInsight } from './services/geminiService';
import { GraphData, Paper, ClusterInsight } from './types';

const App: React.FC = () => {
  const [topic, setTopic] = useState('Transformer Models in Computer Vision');
  const [activeTopic, setActiveTopic] = useState('Transformer Models in Computer Vision');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [clusterInsight, setClusterInsight] = useState<ClusterInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [yearRange, setYearRange] = useState({ min: 2010, max: 2025 });
  const [visibleClusters, setVisibleClusters] = useState<Set<number>>(new Set([0, 1, 2]));
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedPaper(null);
    setSelectedCluster(null);
    setClusterInsight(null);
    setActiveTopic(topic);
    
    try {
      const data = await generateRelatedWorkGraph(topic);
      setGraphData(data);
      
      // Auto-set year range based on data
      if (data.nodes.length > 0) {
        const years = data.nodes.map(n => n.year);
        setYearRange({ min: Math.min(...years), max: Math.max(...years) });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate graph. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered Graph Data
  const filteredData = useMemo(() => {
    if (!graphData) return null;

    const filteredNodes = graphData.nodes.filter(node => 
      node.year >= yearRange.min && 
      node.year <= yearRange.max && 
      visibleClusters.has(node.clusterId)
    );

    const nodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [graphData, yearRange, visibleClusters]);

  const toggleClusterFilter = (id: number) => {
    const next = new Set(visibleClusters);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    setVisibleClusters(next);
  };

  const handleClusterClick = (clusterId: number) => {
    if (clusterId === -1) {
      setSelectedCluster(null);
      setClusterInsight(null);
      return;
    }
    setSelectedCluster(clusterId);
    setClusterInsight(null); 
  };

  const handleGenerateInsight = async () => {
    if (selectedCluster === null || !graphData) return;
    
    setLoadingInsight(true);
    try {
      const clusterPapers = graphData.nodes.filter(n => n.clusterId === selectedCluster);
      const insight = await generateClusterInsight(clusterPapers);
      setClusterInsight(insight);
    } catch (err) {
      console.error(err);
      setError("Failed to generate cluster insights.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 flex flex-col gap-3">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-focus-within:bg-indigo-500/40 transition-all rounded-full"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full flex items-center p-1 pl-6 shadow-2xl">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a research topic..."
                className="bg-transparent flex-1 border-none outline-none text-white text-sm placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 px-3 text-xs font-bold transition-all rounded-full mr-1 ${showFilters ? 'bg-slate-700 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
              >
                Filters
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white p-2 px-6 rounded-full text-xs font-bold transition-all"
              >
                {loading ? 'Analyzing...' : 'Map Field'}
              </button>
            </div>
          </form>

          {showFilters && (
            <div className="relative bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl animate-fade-in">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Year Range ({yearRange.min} - {yearRange.max})</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="2010" 
                      max="2025" 
                      value={yearRange.min}
                      onChange={(e) => setYearRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                      className="w-full accent-indigo-500"
                    />
                    <input 
                      type="range" 
                      min="2010" 
                      max="2025" 
                      value={yearRange.max}
                      onChange={(e) => setYearRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Cluster Visibility</label>
                  <div className="flex gap-2">
                    {[0, 1, 2].map(id => (
                      <button
                        key={id}
                        onClick={() => toggleClusterFilter(id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          visibleClusters.has(id) 
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        C{id + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-lg animate-bounce">
              {error}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium animate-pulse">Gemini is mapping the literature...</p>
            </div>
          ) : filteredData ? (
            <GraphView 
              data={filteredData} 
              onNodeClick={setSelectedPaper} 
              onClusterClick={handleClusterClick}
              selectedCluster={selectedCluster}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              Enter a topic above to visualize related work.
            </div>
          )}
        </main>
        
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 p-4 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Citation</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 border-2 border-dashed border-slate-700 rounded-full"></div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Similarity</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-4 h-4 ring-2 ring-indigo-500 rounded-full flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
             </div>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bridge Paper</span>
           </div>
        </div>
      </div>

      <Sidebar 
        selectedPaper={selectedPaper}
        selectedCluster={selectedCluster}
        insight={clusterInsight}
        isLoadingInsight={loadingInsight}
        onGenerateInsight={handleGenerateInsight}
        searchTopic={activeTopic}
      />
    </div>
  );
};

export default App;
