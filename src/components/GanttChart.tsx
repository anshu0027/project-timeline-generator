"use client";

import React, { useMemo, useState } from "react";
import { ProjectData, Task } from "@/types";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  project: ProjectData;
  onTaskClick: (task: Task) => void;
}

const GanttChart: React.FC<Props> = ({ project, onTaskClick }) => {
  const [zoomLevel, setZoomLevel] = useState(40); // pixels per day
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const { sortedTasks, startDate, endDate, totalDays, phases } = useMemo(() => {
    if (!project.tasks.length) {
      return {
        sortedTasks: [],
        startDate: new Date(),
        endDate: new Date(),
        totalDays: 0,
        phases: [],
      };
    }

    const dates = project.tasks.flatMap((t) => [
      new Date(t.startDate),
      new Date(t.endDate),
    ]);
    const start = new Date(Math.min(...dates.map((d) => d.getTime())));
    const end = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Use exact project bounds
    const diff =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Include final day

    const sorted = [...project.tasks].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    const uniquePhases = Array.from(
      new Set(
        project.tasks.map((t) => t.phase?.toLowerCase() || "uncategorized"),
      ),
    );

    return {
      sortedTasks: sorted,
      startDate: start,
      endDate: end,
      totalDays: diff,
      phases: uniquePhases,
    };
  }, [project]);

  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    const offset = (d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return offset * zoomLevel;
  };

  const getPhaseColor = (phase: string | undefined, isCritical?: boolean) => {
    if (isCritical) return "from-red-500 to-red-600 shadow-red-100";
    const p = phase?.toLowerCase();
    switch (p) {
      case "frontend":
        return "from-blue-500 to-indigo-600 shadow-blue-100";
      case "backend":
        return "from-purple-500 to-violet-600 shadow-purple-100";
      case "database":
        return "from-emerald-500 to-teal-600 shadow-emerald-100";
      default:
        return "from-gray-400 to-gray-500 shadow-gray-100";
    }
  };

  const rowHeight = 56;
  const headerHeight = 80;
  const chartWidth = totalDays * zoomLevel;

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-indigo-100/20 flex flex-col h-full overflow-hidden">
      {/* Premium Toolbar */}
      <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight text-lg">
              Timeline View
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {project.tasks.length} Active Nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100/50">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Scale
            </span>
            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value))}
              className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {["frontend", "backend", "database"].map((p) => (
              <div
                key={p}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100/50"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    p === "frontend"
                      ? "bg-blue-500"
                      : p === "backend"
                        ? "bg-purple-500"
                        : "bg-emerald-500",
                  )}
                />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/30">
        <div style={{ width: chartWidth + 400, position: "relative" }}>
          {/* SVG Layer for Connections and Bars */}
          <svg
            width={chartWidth + 400}
            height={sortedTasks.length * rowHeight + headerHeight + 100}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <defs>
              <marker
                id="arrowhead-gantt"
                markerWidth="8"
                markerHeight="6"
                refX="0"
                refY="3"
                orientation="auto"
              >
                <path d="M0 0 L8 3 L0 6 Z" fill="#cbd5e1" opacity="0.5" />
              </marker>
              {["blue", "purple", "emerald", "red"].map((color) => (
                <linearGradient
                  key={color}
                  id={`grad-${color}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor={`var(--${color}-500)`} />
                  <stop offset="100%" stopColor={`var(--${color}-600)`} />
                </linearGradient>
              ))}
            </defs>

            {/* Dependency Connections */}
            {sortedTasks.map((task, i) => {
              const x = getPosition(task.startDate);
              const y = headerHeight + i * rowHeight + 16;

              return task.dependencies.map((depId) => {
                const depTask = project.tasks.find((t) => t.id === depId);
                if (!depTask) return null;
                const depIndex = sortedTasks.findIndex((t) => t.id === depId);
                const depX = getPosition(depTask.endDate);
                const depY = headerHeight + depIndex * rowHeight + 16 + 12;

                const midX = depX + (x - depX) / 2;
                const path = `M ${depX} ${depY} C ${midX} ${depY}, ${midX} ${y + 12}, ${x - 4} ${y + 12}`;

                const isHovered =
                  hoveredTask === task.id || hoveredTask === depId;

                return (
                  <motion.path
                    key={`${task.id}-${depId}`}
                    d={path}
                    fill="none"
                    stroke={isHovered ? "#6366f1" : "#e2e8f0"}
                    strokeWidth={isHovered ? 2 : 1.5}
                    strokeDasharray={
                      task.isCriticalPath && depTask.isCriticalPath
                        ? "4 4"
                        : "none"
                    }
                    markerEnd="url(#arrowhead-gantt)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: isHovered ? 1 : 0.4 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                );
              });
            })}
          </svg>

          {/* Table Background Grid */}
          <div className="absolute inset-0 z-0">
            {/* Header */}
            <div
              className="sticky top-0 h-[80px] bg-white border-b border-gray-100 flex z-40 shadow-sm"
              style={{ width: chartWidth + 400 }}
            >
              {Array.from({ length: totalDays }).map((_, i) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-shrink-0 border-r border-gray-50 flex flex-col items-center justify-center gap-1",
                      isWeekend && "bg-gray-50/50",
                    )}
                    style={{ width: zoomLevel }}
                  >
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-black",
                        isToday
                          ? "text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-lg"
                          : "text-gray-500",
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <span className="text-[8px] font-bold text-gray-300 uppercase letter-spacing-1">
                      {date.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Row Backgrounds */}
            {sortedTasks.map((task, i) => (
              <div
                key={task.id}
                className={cn(
                  "h-[56px] border-b border-gray-50/50 flex",
                  hoveredTask === task.id
                    ? "bg-indigo-50/30"
                    : i % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50/10",
                )}
                style={{ width: chartWidth + 400 }}
              />
            ))}

            {/* Today Line */}
            {(() => {
              const todayPos = getPosition(new Date().toISOString());
              if (todayPos >= 0 && todayPos <= chartWidth) {
                return (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-red-500/30 w-px z-[35] pointer-events-none"
                    style={{ left: todayPos }}
                  >
                    <div className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full absolute -top-1 -left-[20px]">
                      TODAY
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Interactive Task Bars */}
          <div className="absolute top-[80px] left-0 right-0 z-20">
            {sortedTasks.map((task, i) => {
              const x = getPosition(task.startDate);
              const endX = getPosition(task.endDate);
              const width = Math.max(endX - x, 40);

              return (
                <div
                  key={task.id}
                  className="h-[56px] relative group"
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <motion.div
                    onClick={() => onTaskClick(task)}
                    initial={{ x: x - 20, opacity: 0 }}
                    animate={{ x: x, opacity: 1 }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      "absolute top-4 h-6 rounded-full cursor-pointer shadow-lg transition-all flex items-center px-4 overflow-hidden group/bar border border-white/20",
                      "bg-gradient-to-r",
                      getPhaseColor(task.phase, task.isCriticalPath),
                    )}
                    style={{
                      width: width,
                      zIndex: hoveredTask === task.id ? 50 : 20,
                    }}
                  >
                    <AnimatePresence>
                      {hoveredTask === task.id && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
                        />
                      )}
                    </AnimatePresence>

                    <span className="text-[10px] font-black text-white uppercase tracking-wider relative z-10 whitespace-nowrap overflow-hidden text-ellipsis">
                      {task.name}
                    </span>

                    {task.type === "milestone" && (
                      <div className="absolute right-1 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </motion.div>

                  {/* Context Label (if visible) */}
                  {width < 120 && (
                    <div
                      className="absolute top-[20px] text-[10px] font-black text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30"
                      style={{ left: x + width + 12 }}
                    >
                      {task.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-8 py-3 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Critical Path
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full border-2 border-amber-500 bg-white" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Milestones
            </span>
          </div>
        </div>
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
          Crafted by Antigravity v4
        </p>
      </div>
    </div>
  );
};

export default GanttChart;
