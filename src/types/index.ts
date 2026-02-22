export interface Task {
  id: string;
  name: string;
  durationDays: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  dependencies: string[]; // IDs of tasks that must finish before this starts
  phase?: string;
  type: "task" | "milestone";
  isCriticalPath?: boolean;
}

export interface ProjectData {
  name: string;
  tasks: Task[];
  assumptions: string[];
  risks: string[];
  criticalPath: string[]; // List of task IDs
  summary: string;
}

export type ViewMode = "gantt" | "network" | "roadmap";
export type AIProvider = "gemini" | "openai" | "claude";

export interface AppState {
  aiProvider: AIProvider;
  project: ProjectData | null;
  isLoading: boolean;
  error: string | null;
}
