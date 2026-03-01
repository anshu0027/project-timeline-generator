"use client";

import React, { useState } from "react";
import { AIProvider } from "@/types";

interface Props {
  currentProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

const SettingsMenu: React.FC<Props> = ({
  currentProvider,
  onProviderChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const providers = [
    {
      id: "gemini",
      name: "Google Gemini",
      desc: "Fast & Reliable (System Key)",
      icon: "✨",
    },
    {
      id: "openai",
      name: "OpenAI ChatGPT",
      desc: "GPT-4o Integration",
      icon: "🤖",
    },
    {
      id: "claude",
      name: "Anthropic Claude",
      desc: "Claude 3.5 Sonnet",
      icon: "🎨",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-600 border border-gray-100 shadow-sm bg-white active:scale-95"
        title="Settings"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
            <div className="p-5 border-b bg-gray-50/50">
              <h3 className="font-black text-gray-900 tracking-tight">
                AI Settings
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Provider Engine
              </p>
            </div>
            <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className={`relative p-1 rounded-xl transition-all ${
                    currentProvider === p.id
                      ? "bg-indigo-50/50 ring-1 ring-indigo-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => {
                      onProviderChange(p.id as AIProvider);
                    }}
                    className="w-full text-left p-3 flex items-center gap-4"
                  >
                    <span className="text-2xl drop-shadow-sm">{p.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-black tracking-tight ${currentProvider === p.id ? "text-indigo-900" : "text-gray-700"}`}
                      >
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        {p.desc}
                      </p>
                    </div>
                    {currentProvider === p.id && (
                      <span className="text-indigo-600">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>

                  {currentProvider === p.id && p.id !== "gemini" && (
                    <div className="px-3 pb-3 pt-1 space-y-2">
                      <div className="h-px bg-indigo-100 w-full mb-3"></div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                        API Key Configuration
                      </label>
                      <p className="text-xs text-gray-600 leading-tight">
                        To use {p.name}, please add your API key to a{" "}
                        <code className="font-mono bg-gray-100 p-1 rounded">
                          .env.local
                        </code>{" "}
                        file in the root of your project.
                      </p>
                      <p className="text-[9px] text-gray-400 leading-tight">
                        Example:{" "}
                        <code className="font-mono">
                          {p.id === "openai"
                            ? "OPENAI_API_KEY=your_key_here"
                            : "CLAUDE_API_KEY=your_key_here"}
                        </code>
                      </p>
                    </div>
                  )}

                  {currentProvider === p.id && p.id === "gemini" && (
                    <div className="px-3 pb-3 pt-1">
                      <div className="h-px bg-indigo-100 w-full mb-3"></div>
                      <div className="flex items-center gap-2 text-indigo-600 bg-indigo-100/50 p-2 rounded-lg">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          System Authenticated
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center border-t border-gray-100">
              End-to-End Local Execution
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsMenu;
