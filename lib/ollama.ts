const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

/**
 * Calls the local Ollama chat API and returns the assistant's text.
 * Requests JSON-formatted output so callers can parse structured data.
 */
export async function askOllama(
  system: string,
  userMessage: string
): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      options: { temperature: 0.4 },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Ollama request failed (${res.status}). Is the model "${OLLAMA_MODEL}" pulled? ${text}`
    );
  }

  const data = await res.json();
  return data?.message?.content ?? "";
}

export function parseJsonLoose<T>(raw: string): T {
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : raw) as T;
}
