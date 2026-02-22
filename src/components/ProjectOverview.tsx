"use client";

import React from "react";
import { ProjectData } from "@/types";

interface Props {
  project: ProjectData;
}

const ProjectOverview: React.FC<Props> = ({ project }) => {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-3">
        {["frontend", "backend", "database"].map((section) => {
          const count = project.tasks.filter(
            (t) => t.phase?.toLowerCase() === section,
          ).length;
          return (
            <div
              key={section}
              className="bg-white border border-gray-100 p-3 rounded-2xl flex flex-col items-center"
            >
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {section}
              </span>
              <span className="text-xl font-black text-gray-900">{count}</span>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 p-5 rounded-[24px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-32">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
            Avg. Duration
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black">
              {Math.round(
                project.tasks.reduce((acc, t) => acc + t.durationDays, 0) /
                  project.tasks.length,
              )}
            </span>
            <span className="text-sm font-bold opacity-60 uppercase">
              Days / Module
            </span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-32">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Global Span
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">
              {(() => {
                const dates = project.tasks.flatMap((t) => [
                  new Date(t.startDate).getTime(),
                  new Date(t.endDate).getTime(),
                ]);
                const diff = Math.max(...dates) - Math.min(...dates);
                return Math.ceil(diff / (1000 * 60 * 60 * 24));
              })()}
            </span>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
              Total Days
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
          Technical Specification
        </h3>
        <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 shadow-inner">
          {project.summary}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <section className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            Architectural Assumptions
          </h4>
          <ul className="space-y-3">
            {project.assumptions.map((a, i) => (
              <li
                key={i}
                className="text-[11px] font-bold text-gray-600 flex gap-3 items-start"
              >
                <span className="text-gray-300 mt-1">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Identified Risks
          </h4>
          <ul className="space-y-3">
            {project.risks.map((r, i) => (
              <li
                key={i}
                className="text-[11px] font-bold text-gray-600 flex gap-3 items-start"
              >
                <span className="text-gray-300 mt-1">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-gray-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all pointer-events-none" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          Critical implementation Path
        </h4>
        <div className="flex flex-col gap-3">
          {project.criticalPath.map((id, idx) => {
            const task = project.tasks.find((t) => t.id === id);
            return (
              <div key={id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black shrink-0 border border-white/5">
                  {idx + 1}
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-200">
                  {task?.name || id}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ProjectOverview;
