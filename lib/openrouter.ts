const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";

function getApiKey(): string | null {
  const key = process.env.OPENROUTER_KEY?.trim();
  if (!key || key === "your-openrouter-key-here") {
    return null;
  }
  return key;
}

export function isOpenRouterConfigured(): boolean {
  return getApiKey() !== null;
}

function requireApiKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new Error(
      "OPENROUTER_KEY is not set. Add it to .env.local (get a key at https://openrouter.ai/keys)"
    );
  }
  return key;
}

/**
 * Calls the OpenRouter chat API and returns the assistant's text.
 */
export async function askOpenRouter(
  system: string,
  userMessage: string
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireApiKey()}`,
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "KidWell",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 1024,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) {
      throw new Error(
        "OpenRouter API key is invalid. Update OPENROUTER_KEY in .env.local (https://openrouter.ai/keys)"
      );
    }
    throw new Error(`OpenRouter request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Unexpected response from OpenRouter API");
  }
  return content;
}

/** Returns null when OpenRouter is unavailable so routes can use local demo logic. */
export async function tryAskOpenRouter(
  system: string,
  userMessage: string
): Promise<string | null> {
  if (!isOpenRouterConfigured()) {
    return null;
  }
  try {
    return await askOpenRouter(system, userMessage);
  } catch (error) {
    console.warn("OpenRouter unavailable, using demo fallback:", error);
    return null;
  }
}

export function parseJsonLoose<T>(raw: string): T {
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : raw) as T;
}
