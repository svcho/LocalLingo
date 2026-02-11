import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_OLLAMA_URL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  let body: { ollamaUrl?: string; model?: string; prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { ollamaUrl = DEFAULT_OLLAMA_URL, model, prompt } = body;

  if (!model || !prompt) {
    return NextResponse.json(
      { error: "model and prompt are required" },
      { status: 400 }
    );
  }

  try {
    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: true }),
    });

    if (!ollamaResponse.ok) {
      const text = await ollamaResponse.text();
      return NextResponse.json(
        { error: `Ollama error: ${text}` },
        { status: ollamaResponse.status }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Cannot reach Ollama at ${ollamaUrl}: ${message}` },
      { status: 503 }
    );
  }
}
