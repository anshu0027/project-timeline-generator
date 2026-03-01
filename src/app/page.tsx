"use client";

import React, { useState, useEffect } from "react";
import { ProjectData, Task, ViewMode, AIProvider } from "@/types";
import { parseProjectDescription as parseWithGemini } from "@/lib/gemini";
import { parseProjectDescription as parseWithOpenAI } from "@/lib/openai";
import { parseProjectDescription as parseWithClaude } from "@/lib/claude";
import SettingsMenu from "@/components/SettingsMenu";
import GanttChart from "@/components/GanttChart";
import NetworkGraph from "@/components/NetworkGraph";
import ProjectOverview from "@/components/ProjectOverview";
import DailyRoadmap from "@/components/DailyRoadmap";
import {
  Calendar,
  GitGraph,
  LayoutPanelLeft,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [aiProvider, setAiProvider] = useState<AIProvider>("gemini");
  const [project, setProject] = useState<ProjectData | null>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap"); // Default to roadmap now
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Persistence
  useEffect(() => {
    const savedProvider = localStorage.getItem("ai_provider") as AIProvider;
    if (savedProvider) setAiProvider(savedProvider);

    const savedProject = localStorage.getItem("current_project");
    if (savedProject) {
      try {
        setProject(JSON.parse(savedProject));
      } catch (e) {
        console.error("Failed to load project", e);
      }
    }
  }, []);

  useEffect(() => {
    if (project) {
      localStorage.setItem("current_project", JSON.stringify(project));
    }
  }, [project]);

  const handleProviderChange = (provider: AIProvider) => {
    setAiProvider(provider);
    localStorage.setItem("ai_provider", provider);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please describe your project first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let result;
      switch (aiProvider) {
        case "gemini":
          result = await parseWithGemini(inputText);
          break;
        case "openai":
          result = await parseWithOpenAI(inputText);
          break;
        case "claude":
          result = await parseWithClaude(inputText);
          break;
        default:
          throw new Error("Invalid AI provider selected");
      }
      setProject(result);
      setSelectedTask(null);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] overflow-hidden font-sans selection:bg-indigo-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-10 py-5 flex items-center justify-between shadow-sm z-[100] sticky top-0">
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-700 p-3 rounded-[20px] text-white shadow-xl shadow-indigo-100 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 fill-white/20" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none flex items-center gap-2">
              Chronos <span className="text-indigo-600">Visual</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <SettingsMenu
            currentProvider={aiProvider}
            onProviderChange={handleProviderChange}
          />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Architect Input */}
        <aside className="w-[440px] border-r border-gray-100 bg-white flex flex-col p-10 gap-10 overflow-hidden shrink-0 shadow-2xl relative z-[90]">
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto scrollbar-thin pr-2">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
                    Product Specification
                  </label>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    Idea & Features
                  </h2>
                </div>
                <button
                  onClick={() => setInputText("")}
                  className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-all mb-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm"
                >
                  Reset
                </button>
              </div>

              <div className="relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="PROMPT FORMAT:&#10;IDEA: [Your project idea]&#10;FEATURES:&#10;- [Feature 1]&#10;- [Feature 2]"
                  className="w-full h-[320px] px-6 py-6 border border-gray-100 bg-gray-50/30 rounded-[32px] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 focus:bg-white outline-none text-sm resize-none transition-all placeholder:text-gray-300 font-medium leading-relaxed shadow-inner"
                />
                <div className="absolute bottom-5 right-6 px-3 py-1 bg-indigo-600 rounded-lg text-[9px] font-black text-white uppercase tracking-widest pointer-events-none shadow-lg z-10 transition-transform group-focus-within:scale-110">
                  Engineering AI Enabled
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isLoading}
                className={cn(
                  "w-full py-6 rounded-[32px] font-black tracking-tight text-lg transition-all flex items-center justify-center gap-4 shadow-2xl relative overflow-hidden",
                  isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
                )}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Mapping Infrastructure...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white/20" />
                    <span>Generate Engineering Roadmap</span>
                  </>
                )}
              </motion.button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-50 p-5 rounded-[24px] border border-red-100"
                >
                  <div className="bg-red-500 p-1.5 rounded-full text-white shrink-0 mt-0.5">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] font-black text-red-700 leading-tight tracking-tight uppercase">
                    {error}
                  </p>
                </motion.div>
              )}
            </div>

            {project && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 pt-8 border-t border-gray-100"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
                    {project.name}
                  </h2>
                  <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                      Live Model
                    </span>
                  </div>
                </div>
                <ProjectOverview project={project} />
              </motion.div>
            )}
          </div>
        </aside>

        {/* Dashboard: Dynamic Visualizations */}
        <section className="flex-1 p-10 bg-[#fafafa] flex flex-col gap-8 overflow-hidden relative">
          {!project ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="w-40 h-40 bg-white rounded-[48px] shadow-2xl flex items-center justify-center mb-12 ring-1 ring-black/[0.03] relative"
              >
                <div className="absolute inset-0 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[48px] -z-10 animate-pulse" />
                <Sparkles className="w-20 h-20 text-indigo-500" />
              </motion.div>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-6">
                Architecture Blueprint.
              </h2>
              <p className="max-w-xl text-base text-gray-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
                Specify your high-level project vision. Chronos will architect a
                full-stack implementation sequence across Frontend, Backend, and
                Data layers.
              </p>

              <div className="mt-16 flex items-center gap-12 opacity-30">
                {["Timeline", "Interdependencies", "Daily Modules"].map((f) => (
                  <div key={f} className="flex flex-col items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
                      {f}
                    </span>
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Intelligent View Controller */}
              <div className="flex items-center gap-2 bg-white p-2 border border-gray-100 rounded-[28px] self-start shadow-xl shadow-indigo-100/10 ring-1 ring-black/[0.03]">
                <button
                  onClick={() => setViewMode("roadmap")}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                    viewMode === "roadmap"
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  Roadmap
                </button>
                <button
                  onClick={() => setViewMode("gantt")}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                    viewMode === "gantt"
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <LayoutPanelLeft className="w-4 h-4" />
                  Gantt
                </button>
                <button
                  onClick={() => setViewMode("network")}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                    viewMode === "network"
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                      : "text-gray-400 hover:text-gray-900 hover:bg-gray-50",
                  )}
                >
                  <GitGraph className="w-4 h-4" />
                  Network
                </button>
              </div>

              {/* Visualization Theater */}
              <div className="flex-1 min-h-0 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full w-full"
                  >
                    {viewMode === "roadmap" ? (
                      <DailyRoadmap
                        project={project}
                        onTaskClick={setSelectedTask}
                      />
                    ) : viewMode === "gantt" ? (
                      <GanttChart
                        project={project}
                        onTaskClick={setSelectedTask}
                      />
                    ) : (
                      <NetworkGraph
                        project={project}
                        onTaskClick={setSelectedTask}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Global Detail Overlay */}
                <AnimatePresence>
                  {selectedTask && (
                    <motion.div
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 100 }}
                      className="absolute bottom-6 left-6 right-6 z-[110]"
                    >
                      <div className="bg-white border-t-8 border-indigo-600 rounded-[40px] shadow-2xl p-12 flex flex-col gap-10 ring-1 ring-black/5">
                        <div className="flex justify-between items-start">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <span
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]",
                                  selectedTask.type === "milestone"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-indigo-50 text-indigo-700",
                                )}
                              >
                                {selectedTask.type}
                              </span>
                              {selectedTask.isCriticalPath && (
                                <div className="bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">
                                    Critical Priority
                                  </span>
                                </div>
                              )}
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
                              {selectedTask.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => setSelectedTask(null)}
                            className="text-gray-300 hover:text-gray-900 p-4 transition-all bg-gray-50 rounded-[24px] hover:bg-gray-100 active:scale-95"
                          >
                            <Terminal className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
                          <div className="space-y-3">
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                              Execution window
                            </p>
                            <p className="text-2xl font-black text-gray-800 tracking-tight">
                              {selectedTask.durationDays} Days
                            </p>
                          </div>
                          <div className="space-y-3">
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                              Calendar span
                            </p>
                            <p className="text-2xl font-black text-gray-800 tracking-tight">
                              {new Date(
                                selectedTask.startDate,
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                              <span className="text-gray-300 mx-2">/</span>
                              {new Date(
                                selectedTask.endDate,
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                              Module Phase
                            </p>
                            <p className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                              {selectedTask.phase || "Logic"}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                              Prerequisites
                            </p>
                            <p className="text-2xl font-black text-gray-800 tracking-tight">
                              {selectedTask.dependencies.length} Nodes
                            </p>
                          </div>
                        </div>

                        {selectedTask.dependencies.length > 0 && (
                          <div className="border-t border-gray-100 pt-10">
                            <p className="text-gray-400 font-black uppercase text-[9px] tracking-[0.3em] mb-6">
                              Blocking Dependencies
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {selectedTask.dependencies.map((depId) => {
                                const dep = project.tasks.find(
                                  (t) => t.id === depId,
                                );
                                return (
                                  <motion.button
                                    key={depId}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedTask(dep || null)}
                                    className="px-6 py-3 bg-gray-50 hover:bg-white hover:border-indigo-400 hover:text-indigo-700 transition-all rounded-[20px] text-[11px] font-black uppercase tracking-widest text-gray-500 border border-gray-100 flex items-center gap-3 shadow-.env.local"
                                  >
                                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                                    {dep?.name || depId}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
