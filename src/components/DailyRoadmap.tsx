"use client";

import React, { useMemo } from "react";
import { ProjectData, Task } from "@/types";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Database,
  Layout,
  Server,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  project: ProjectData;
  onTaskClick: (task: Task) => void;
}

const DailyRoadmap: React.FC<Props> = ({ project, onTaskClick }) => {
  // Group activities by date
  const schedule = useMemo(() => {
    const dates: Record<string, Task[]> = {};

    // Get all unique dates within project range
    if (!project.tasks.length) return [];

    const startDates = project.tasks.map((t) =>
      new Date(t.startDate).getTime(),
    );
    const endDates = project.tasks.map((t) => new Date(t.endDate).getTime());

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    const curr = new Date(minDate);
    while (curr <= maxDate) {
      const dateStr = curr.toISOString().split("T")[0];

      // Find tasks active on this day
      const activeTasks = project.tasks.filter((t) => {
        const s = new Date(t.startDate).toISOString().split("T")[0];
        const e = new Date(t.endDate).toISOString().split("T")[0];
        return dateStr >= s && dateStr <= e;
      });

      if (activeTasks.length > 0) {
        dates[dateStr] = activeTasks;
      }

      curr.setDate(curr.getDate() + 1);
    }

    return Object.entries(dates).sort((a, b) => a[0].localeCompare(b[0]));
  }, [project]);

  const getPhaseIcon = (phase: string | undefined) => {
    switch (phase?.toLowerCase()) {
      case "frontend":
        return Layout;
      case "backend":
        return Server;
      case "database":
        return Database;
      default:
        return Circle;
    }
  };

  const getPhaseColor = (phase: string | undefined) => {
    switch (phase?.toLowerCase()) {
      case "frontend":
        return "text-blue-500 bg-blue-50 border-blue-100";
      case "backend":
        return "text-purple-500 bg-purple-50 border-purple-100";
      case "database":
        return "text-emerald-500 bg-emerald-50 border-emerald-100";
      default:
        return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-indigo-100/20 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 tracking-tight text-lg">
              Daily Schedule
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Iterative Implementation Plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
          <TrendingUp className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Optimal Sequence
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 scrollbar-thin">
        <div className="max-w-4xl mx-auto space-y-12 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-0.5 bg-gray-200/50" />

          {schedule.map(([date, tasks], dayIdx) => {
            const dateObj = new Date(date);
            const isToday = date === new Date().toISOString().split("T")[0];

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dayIdx * 0.05 }}
                className="relative flex gap-10"
              >
                {/* Date Marker */}
                <div className="flex flex-col items-center w-20 flex-shrink-0 pt-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {dateObj.toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </span>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all z-10",
                      isToday
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                        : "bg-white border border-gray-200 text-gray-900",
                    )}
                  >
                    {dateObj.getDate()}
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-gray-400 uppercase">
                    {dateObj.toLocaleDateString(undefined, { month: "short" })}
                  </span>
                </div>

                {/* Daily Tasks */}
                <div className="flex-1 space-y-4 pb-4">
                  {tasks.map((task) => {
                    const Icon = getPhaseIcon(task.phase);
                    const colors = getPhaseColor(task.phase);

                    return (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.01, x: 4 }}
                        onClick={() => onTaskClick(task)}
                        className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "px-2.5 py-1 rounded-lg border flex items-center gap-2",
                                  colors,
                                )}
                              >
                                <Icon className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                  {task.phase || "Module"}
                                </span>
                              </div>
                              {task.isCriticalPath && (
                                <div className="bg-red-50 text-red-500 border border-red-100 px-2 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
                                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">
                                    Critical Path
                                  </span>
                                </div>
                              )}
                            </div>

                            <h4 className="text-base font-black text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                              {task.name}
                            </h4>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-bold">
                                  {task.durationDays} Days Duration
                                </span>
                              </div>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span className="text-[10px] font-bold">
                                    {task.dependencies.length} Prerequisites
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-2.5 rounded-xl text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-8 py-3 border-t border-gray-50 bg-gray-50/50 flex justify-center">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
          Chronological Technical Stack Implementation
        </p>
      </div>
    </div>
  );
};

export default DailyRoadmap;
