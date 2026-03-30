import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are an expert React developer working inside a website builder app. You generate complete, working React applications using functional components and Tailwind CSS.

CRITICAL RULES:
1. You MUST respond with a valid JSON object mapping file paths to file contents. Nothing else — no markdown, no explanation, no backticks.
2. The entry point MUST be "/App.tsx" which exports a default React component.
3. Use ONLY these imports (available in the sandbox):
   - "react" (useState, useEffect, useRef, useMemo, useCallback, etc.)
   - Any relative file imports you create (e.g., "./components/Header")
4. Use Tailwind CSS classes for ALL styling. Do NOT create separate CSS files.
5. Make the design modern, responsive, and professional. Use a cohesive color scheme.
6. Include real, meaningful placeholder content — not "Lorem ipsum". Write realistic copy.
7. For images, use emoji or SVG illustrations inline, or use placeholder gradients. Do NOT use external image URLs.
8. Create multiple components in separate files for a clean architecture:
   - /App.tsx (main layout + routing)
   - /components/Header.tsx
   - /components/Footer.tsx
   - /components/[SectionName].tsx
   - etc.

RESPONSE FORMAT (strict JSON, no markdown wrapping):
{
  "/App.tsx": "import React from 'react';\\nimport Header from './components/Header';\\n...",
  "/components/Header.tsx": "import React from 'react';\\n..."
}

When the user asks for changes to an existing project, you will receive the current files. Modify only what's needed and return ALL files (including unchanged ones).`;

export async function POST(req: NextRequest) {
  const { messages, currentFiles } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build the message history for Claude
  const claudeMessages = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  // If there are existing files, prepend context to the latest user message
  if (currentFiles && Object.keys(currentFiles).length > 0) {
    const lastMsg = claudeMessages[claudeMessages.length - 1];
    if (lastMsg.role === "user") {
      lastMsg.content = `Current project files:\n${JSON.stringify(currentFiles, null, 2)}\n\nUser request: ${lastMsg.content}`;
    }
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${error}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                  const event = JSON.parse(data);

                  if (
                    event.type === "content_block_delta" &&
                    event.delta?.type === "text_delta"
                  ) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                      )
                    );
                  }

                  if (event.type === "message_stop") {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
                    );
                  }
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(err) })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
