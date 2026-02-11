import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_OLLAMA_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ollamaUrl = searchParams.get("ollamaUrl") || DEFAULT_OLLAMA_URL;

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Ollama returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Cannot reach Ollama at ${ollamaUrl}: ${message}` },
      { status: 503 }
    );
  }
}
