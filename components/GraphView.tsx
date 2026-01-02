
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, Paper, Link } from '../types';

interface GraphViewProps {
  data: GraphData;
  onNodeClick: (paper: Paper) => void;
  onClusterClick: (clusterId: number) => void;
  selectedCluster: number | null;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const GraphView: React.FC<GraphViewProps> = ({ data, onNodeClick, onClusterClick, selectedCluster }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Simulation
    const simulation = d3.forceSimulation<Paper>(data.nodes as any)
      .force('link', d3.forceLink<Paper, any>(data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', (d) => d.type === 'citation' ? '#475569' : '#334155')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => d.type === 'citation' ? 2 : 1)
      .attr('stroke-dasharray', (d) => d.type === 'similarity' ? '4,4' : '0');

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      })
      .call(d3.drag<any, Paper>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          (d as any).fx = (d as any).x;
          (d as any).fy = (d as any).y;
        })
        .on('drag', (event, d) => {
          (d as any).fx = event.x;
          (d as any).fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          (d as any).fx = null;
          (d as any).fy = null;
        }));

    // Node Circles
    node.append('circle')
      .attr('r', (d) => d.isBridge ? 12 : 8)
      .attr('fill', (d) => COLORS[d.clusterId % COLORS.length])
      .attr('stroke', (d) => selectedCluster === d.clusterId ? '#fff' : 'none')
      .attr('stroke-width', 3)
      .attr('class', 'transition-all duration-300');

    // Node Labels
    node.append('text')
      .text((d) => d.title.length > 20 ? d.title.substring(0, 17) + '...' : d.title)
      .attr('x', 14)
      .attr('y', 4)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Background click to deselect
    svg.on('click', () => {
      onClusterClick(-1);
    });

    return () => simulation.stop();
  }, [data, selectedCluster]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Clusters</h2>
        <div className="flex gap-4">
          {[0, 1, 2].map((id) => (
            <button
              key={id}
              onClick={(e) => {
                e.stopPropagation();
                onClusterClick(id);
              }}
              className={`pointer-events-auto px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCluster === id 
                ? 'ring-2 ring-white scale-110 shadow-lg' 
                : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: COLORS[id % COLORS.length] }}
            >
              Cluster {id + 1}
            </button>
          ))}
        </div>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        viewBox={`0 0 ${containerRef.current?.clientWidth || 800} ${containerRef.current?.clientHeight || 600}`}
      />
    </div>
  );
};

export default GraphView;
