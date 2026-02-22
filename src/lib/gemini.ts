import { GoogleGenAI, Type } from "@google/genai";
import { ProjectData } from "@/types";

const SYSTEM_INSTRUCTION = `
You are a strict technical project planning AI.

Your ONLY input will be:
- A project idea
- A clearly defined list of features

You MUST:
1. Create a structured JSON project timeline model.
2. Only generate tasks directly required to implement the provided features.
3. Do NOT add extra features, improvements, optimizations, or assumptions beyond what is explicitly written.
4. Do NOT invent technical scope that was not mentioned.
5. Do NOT expand product vision.
6. Work strictly within the described feature list.

Scope Rules:
- Timeline must be divided into three sections only:
  a) frontend
  b) backend
  c) database
- MAXIMUM TOTAL DURATION: 15 Days for complex ideas.
- VIBE CODING VELOCITY: Assume development is "vibe coded" (AI-assisted and AI coded rapid prototyping and full project development), which reduces effort by 60-70%.
- For common or standard project ideas, target a completion timeline of 6-7 DAYS total.
- No DevOps, no deployment, no testing, no marketing, no analytics unless explicitly mentioned in features.
- Every task must map directly to a provided feature.

Planning Rules:
1. Infer a project name only from the given idea.
2. Break each feature into implementation-level tasks under:
   - frontend
   - backend
   - database
3. Assign start_date and end_date in ISO format.
   - Assume today's date is ${new Date().toISOString().split("T")[0]}.
4. Respect logical sequencing.
   - Backend APIs must exist before frontend integration.
   - Database schema must exist before backend logic depending on it.
5. Identify dependencies using task IDs.
6. Calculate and return the critical_path (array of task IDs).
7. List assumptions ONLY if required due to missing technical detail.
8. Flag timeline conflicts or logical violations.

Date Constraints:
- No task can start before its dependencies end.
- No overlapping tasks if they share dependency chains.
- Keep durations realistic for a solo developer unless stated otherwise.

Output Format:
Return ONLY valid JSON.
No explanation.
No commentary.
No markdown.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    summary: { type: Type.STRING },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          durationDays: { type: Type.NUMBER },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          dependencies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          phase: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["task", "milestone"] },
          isCriticalPath: { type: Type.BOOLEAN },
        },
        required: [
          "id",
          "name",
          "durationDays",
          "startDate",
          "endDate",
          "dependencies",
          "type",
        ],
      },
    },
    assumptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    criticalPath: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "name",
    "summary",
    "tasks",
    "assumptions",
    "risks",
    "criticalPath",
  ],
};

export async function parseProjectDescription(
  description: string,
  apiKey: string,
): Promise<ProjectData> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this project description into a structured timeline: \n\n${description}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text.trim()) as ProjectData;
}
