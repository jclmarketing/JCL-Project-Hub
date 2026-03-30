"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import {
  createAIProject,
  updateAIProject,
  getAIProject,
  type AIProject,
} from "@/app/lib/supabase/ai-projects";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_FILES: Record<string, string> = {
  "/App.tsx": `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">&#x2728;</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Describe your website
        </h1>
        <p className="text-zinc-400 max-w-md">
          Type a prompt in the chat to start building. The AI will generate
          a complete React application with Tailwind CSS.
        </p>
      </div>
    </div>
  );
}
`,
};

// ── Streaming helper ────────────────────────────────────────────────
async function streamGenerate(
  messages: Message[],
  currentFiles: Record<string, string>,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, currentFiles }),
  });

  if (!res.ok) {
    const err = await res.json();
    onError(err.error || "Generation failed");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.text) onChunk(data.text);
          if (data.done) onDone();
          if (data.error) onError(data.error);
        } catch {
          // skip
        }
      }
    }
  }
  onDone();
}

// ── Parse JSON from streamed text ───────────────────────────────────
function parseFilesFromResponse(text: string): Record<string, string> | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    // Try to find JSON object in the text
    const braceStart = text.indexOf("{");
    const braceEnd = text.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      try {
        return JSON.parse(text.slice(braceStart, braceEnd + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ── View toggle icons ───────────────────────────────────────────────
function PreviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

// ── Main page component ─────────────────────────────────────────────
export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageInner />
    </Suspense>
  );
}

function CreatePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");

  const [files, setFiles] = useState<Record<string, string>>(DEFAULT_FILES);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [project, setProject] = useState<AIProject | null>(null);
  const [projectName, setProjectName] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [view, setView] = useState<"preview" | "code" | "split">("preview");
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load existing project if ID provided
  useEffect(() => {
    if (projectId) {
      getAIProject(projectId).then((p) => {
        if (p) {
          setProject(p);
          setMessages(p.messages);
          if (Object.keys(p.files).length > 0) setFiles(p.files);
        }
      });
    }
  }, [projectId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
    },
    []
  );

  // ── Send message ──────────────────────────────────────────────────
  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    setInput("");
    setError(null);
    if (inputRef.current) inputRef.current.style.height = "auto";

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsGenerating(true);
    setStreamText("");

    let fullText = "";

    await streamGenerate(
      newMessages,
      files,
      (chunk) => {
        fullText += chunk;
        setStreamText(fullText);
      },
      () => {
        const parsed = parseFilesFromResponse(fullText);
        if (parsed && Object.keys(parsed).length > 0) {
          // Ensure all file paths start with /
          const normalised: Record<string, string> = {};
          for (const [path, content] of Object.entries(parsed)) {
            const normPath = path.startsWith("/") ? path : `/${path}`;
            normalised[normPath] = content;
          }
          setFiles(normalised);
          const assistantMsg: Message = {
            role: "assistant",
            content: fullText,
          };
          const updatedMessages = [...newMessages, assistantMsg];
          setMessages(updatedMessages);

          // Auto-save if we have a project
          if (project) {
            updateAIProject(project.id, {
              files: normalised,
              messages: updatedMessages,
            });
          }
        } else if (fullText.trim()) {
          // Non-file response (explanation, question, etc.)
          const assistantMsg: Message = {
            role: "assistant",
            content: fullText,
          };
          setMessages([...newMessages, assistantMsg]);
        }

        setIsGenerating(false);
        setStreamText("");
      },
      (err) => {
        setError(err);
        setIsGenerating(false);
        setStreamText("");
      }
    );
  };

  // ── Save project ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (project) {
      await updateAIProject(project.id, { files, messages });
      return;
    }
    setShowNameDialog(true);
  };

  const handleCreateProject = async () => {
    const name = projectName.trim();
    if (!name) return;

    const newProject = await createAIProject(name, messages[0]?.content || "");
    await updateAIProject(newProject.id, { files, messages });
    setProject(newProject);
    setShowNameDialog(false);
    setProjectName("");
    router.replace(`/create?id=${newProject.id}`);
  };

  // ── Sandpack files format ─────────────────────────────────────────
  const sandpackFiles: Record<string, string> = {};
  for (const [path, code] of Object.entries(files)) {
    sandpackFiles[path] = code;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Hub
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-sm font-medium text-white">
            {project?.name || "New Project"}
          </span>
          {project && (
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              AI Generated
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setView("preview")}
              className={`p-1.5 rounded-md transition-colors ${view === "preview" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Preview"
            >
              <PreviewIcon />
            </button>
            <button
              onClick={() => setView("split")}
              className={`p-1.5 rounded-md transition-colors ${view === "split" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Split view"
            >
              <SplitIcon />
            </button>
            <button
              onClick={() => setView("code")}
              className={`p-1.5 rounded-md transition-colors ${view === "code" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Code"
            >
              <CodeIcon />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
          >
            {project ? "Save" : "Save Project"}
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">
        {/* ── Chat panel (left) ────────────────────────────────── */}
        <div className="w-[380px] shrink-0 border-r border-white/5 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isGenerating && (
              <div className="text-center pt-20">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">&#x1F680;</span>
                </div>
                <p className="text-sm text-zinc-400 mb-1">
                  What would you like to build?
                </p>
                <p className="text-xs text-zinc-600">
                  Describe a website and AI will generate it
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white/5 text-zinc-300"
                  }`}
                >
                  {msg.role === "user"
                    ? msg.content
                    : msg.content.startsWith("{")
                      ? "Updated the project files."
                      : msg.content.length > 200
                        ? "Generated project files successfully."
                        : msg.content}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Generating
                    <span className="animate-pulse">...</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-end gap-2 bg-white/5 rounded-xl border border-white/5 p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe what you want to build..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 resize-none outline-none max-h-40 py-1 px-1"
              />
              <button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
                className="shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-zinc-700 mt-1.5 px-1">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* ── Preview / Code panel (right) ─────────────────────── */}
        <div className="flex-1 min-w-0">
          <SandpackProvider
            template="react-ts"
            theme={{
              colors: {
                surface1: "#0a0a0a",
                surface2: "#141414",
                surface3: "#1a1a1a",
                clickable: "#999",
                base: "#808080",
                disabled: "#4D4D4D",
                hover: "#C5C5C5",
                accent: "#3B82F6",
                error: "#EF4444",
                errorSurface: "#1e1e1e",
              },
              syntax: {
                plain: "#D4D4D4",
                comment: { color: "#6A9955", fontStyle: "italic" },
                keyword: "#C586C0",
                tag: "#569CD6",
                punctuation: "#D4D4D4",
                definition: "#DCDCAA",
                property: "#9CDCFE",
                static: "#B5CEA8",
                string: "#CE9178",
              },
              font: {
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                mono: '"Geist Mono", "Fira Code", "Fira Mono", monospace',
                size: "13px",
                lineHeight: "20px",
              },
            }}
            files={sandpackFiles}
            customSetup={{
              dependencies: {
                "react": "^18.0.0",
                "react-dom": "^18.0.0",
              },
            }}
            options={{
              externalResources: [
                "https://cdn.tailwindcss.com",
              ],
              activeFile: "/App.tsx",
            }}
          >
            <div className="h-full flex">
              {/* Code editor */}
              {(view === "code" || view === "split") && (
                <div className={`flex ${view === "split" ? "w-1/2" : "w-full"} border-r border-white/5`}>
                  <div className="w-48 shrink-0 border-r border-white/5 overflow-y-auto">
                    <SandpackFileExplorer />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <SandpackCodeEditor
                      showLineNumbers
                      showTabs
                      closableTabs
                      wrapContent
                      style={{ height: "100%" }}
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              {(view === "preview" || view === "split") && (
                <div className={view === "split" ? "w-1/2" : "w-full"}>
                  <SandpackPreview
                    showOpenInCodeSandbox={false}
                    showRefreshButton
                    style={{ height: "100%" }}
                  />
                </div>
              )}
            </div>
          </SandpackProvider>
        </div>
      </div>

      {/* ── Save dialog ──────────────────────────────────────────── */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-[400px]">
            <h3 className="text-white font-medium mb-1">Save Project</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Give your project a name to save it to the hub.
            </p>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              placeholder="e.g. Apex Security Website"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNameDialog(false)}
                className="text-xs px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
                className="text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
