"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ProjectData, Task } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Layout, Server, Zap, Milestone, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  project: ProjectData;
  onTaskClick: (task: Task) => void;
}

const NetworkGraph: React.FC<Props> = ({ project, onTaskClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !project.tasks.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // Define hierarchies for ranking
    // Simple ranking: Depth from root (no dependencies)
    const taskMap = new Map<string, Task>(project.tasks.map((t) => [t.id, t]));
    const depthMap = new Map<string, number>();

    const getDepth = (id: string, visited = new Set<string>()): number => {
      if (depthMap.has(id)) return depthMap.get(id)!;
      if (visited.has(id)) return 0; // Circular dependency fallback

      visited.add(id);
      const task = taskMap.get(id);
      if (!task || task.dependencies.length === 0) {
        depthMap.set(id, 0);
        return 0;
      }

      const maxDepDepth = Math.max(
        ...task.dependencies.map((d) => getDepth(d, new Set(visited))),
      );
      const currentDepth = maxDepDepth + 1;
      depthMap.set(id, currentDepth);
      return currentDepth;
    };

    project.tasks.forEach((t) => getDepth(t.id));
    const maxDepth = Math.max(...Array.from(depthMap.values()), 1);

    const nodes = project.tasks.map((t) => ({
      ...t,
      x: (depthMap.get(t.id)! / maxDepth) * (width - 200) + 100,
      y:
        (project.tasks.indexOf(t) / project.tasks.length) * (height - 100) + 50,
    }));

    const links: any[] = [];
    project.tasks.forEach((task) => {
      task.dependencies.forEach((depId) => {
        links.push({ source: depId, target: task.id });
      });
    });

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force(
        "x",
        d3
          .forceX(
            (d: any) => (depthMap.get(d.id)! / maxDepth) * (width - 200) + 100,
          )
          .strength(1),
      )
      .force("y", d3.forceY(height / 2).strength(0.1))
      .force("collision", d3.forceCollide().radius(80));

    // Arrowhead marker
    const defs = svg.append("defs");

    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 45)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#cbd5e1");

    defs
      .append("filter")
      .attr("id", "glow")
      .append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");

    const linkGroup = svg.append("g");
    const nodeGroup = svg.append("g");

    const link = linkGroup
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d: any) =>
        d.source.isCriticalPath && d.target.isCriticalPath
          ? "#fecaca"
          : "#f1f5f9",
      )
      .attr("stroke-width", (d: any) =>
        d.source.isCriticalPath && d.target.isCriticalPath ? 3 : 2,
      )
      .attr("stroke-dasharray", (d: any) =>
        d.source.isCriticalPath && d.target.isCriticalPath ? "none" : "4 2",
      )
      .attr("marker-end", "url(#arrowhead)");

    const node = nodeGroup
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "cursor-pointer")
      .on("click", (event, d) => {
        onTaskClick(d as any);
        setSelectedId(d.id);
      })
      .on("mouseenter", (event, d) => {
        link
          .attr("stroke", (l: any) =>
            l.source.id === d.id || l.target.id === d.id
              ? "#6366f1"
              : l.source.isCriticalPath && l.target.isCriticalPath
                ? "#fecaca"
                : "#f1f5f9",
          )
          .attr("stroke-opacity", (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.2,
          );
      })
      .on("mouseleave", () => {
        link
          .attr("stroke", (l: any) =>
            l.source.isCriticalPath && l.target.isCriticalPath
              ? "#fecaca"
              : "#f1f5f9",
          )
          .attr("stroke-opacity", 1);
      })
      .call(
        d3
          .drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Node Containers (Rectangles)
    node
      .append("rect")
      .attr("width", 160)
      .attr("height", 60)
      .attr("x", -80)
      .attr("y", -30)
      .attr("rx", 16)
      .attr("fill", "#fff")
      .attr("stroke", (d: any) => {
        if (d.isCriticalPath) return "#ef4444";
        const phase = d.phase?.toLowerCase();
        if (phase === "frontend") return "#3b82f6";
        if (phase === "backend") return "#8b5cf6";
        if (phase === "database") return "#10b981";
        return "#e2e8f0";
      })
      .attr("stroke-width", 2)
      .attr("class", "node-rect drop-shadow-sm");

    // Phase Indicator Dot
    node
      .append("circle")
      .attr("r", 4)
      .attr("cx", -65)
      .attr("cy", -12)
      .attr("fill", (d: any) => {
        if (d.isCriticalPath) return "#ef4444";
        const phase = d.phase?.toLowerCase();
        if (phase === "frontend") return "#3b82f6";
        if (phase === "backend") return "#8b5cf6";
        if (phase === "database") return "#10b981";
        return "#94a3b8";
      });

    // Task Name
    node
      .append("text")
      .attr("x", -55)
      .attr("y", -8)
      .text((d: any) =>
        d.name.length > 20 ? d.name.substring(0, 18) + "..." : d.name,
      )
      .attr("font-size", "10px")
      .attr("font-weight", "900")
      .attr(
        "class",
        "uppercase tracking-widest text-gray-800 pointer-events-none",
      );

    // Phase Name
    node
      .append("text")
      .attr("x", -65)
      .attr("y", 10)
      .text((d: any) => d.phase || "Task")
      .attr("font-size", "8px")
      .attr("font-weight", "bold")
      .attr(
        "class",
        "uppercase tracking-[0.2em] text-gray-400 pointer-events-none",
      );

    // Critical Path Badge
    node
      .filter((d: any) => d.isCriticalPath)
      .append("rect")
      .attr("x", 15)
      .attr("y", 15)
      .attr("width", 60)
      .attr("height", 12)
      .attr("rx", 4)
      .attr("fill", "#fee2e2");

    node
      .filter((d: any) => d.isCriticalPath)
      .append("text")
      .attr("x", 45)
      .attr("y", 24)
      .attr("text-anchor", "middle")
      .text("CRITICAL")
      .attr("font-size", "7px")
      .attr("font-weight", "900")
      .attr("fill", "#ef4444")
      .attr("class", "pointer-events-none");

    simulation.on("tick", () => {
      link.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [project, onTaskClick]);

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-indigo-100/20 h-full relative overflow-hidden flex flex-col">
      {/* Premium Toolbar */}
      <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight text-lg">
              Dependency Flow
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Architectural Graph
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { id: "frontend", color: "bg-blue-500", icon: Layout },
            { id: "backend", color: "bg-purple-500", icon: Server },
            { id: "database", color: "bg-emerald-500", icon: Database },
          ].map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100/50"
            >
              <p.icon
                className={cn(
                  "w-3 h-3",
                  p.id === "frontend"
                    ? "text-blue-500"
                    : p.id === "backend"
                      ? "text-purple-500"
                      : "text-emerald-500",
                )}
              />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                {p.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-gray-50/20">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default NetworkGraph;
