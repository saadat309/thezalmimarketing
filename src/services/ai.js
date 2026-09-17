// AI Service for communicating with The Zalmi Marketing AI Worker
const AI_WORKER_URL = import.meta.env.VITE_AI_API_URL || "https://ai.thezalmimarketing.com/chat";

export async function sendAIChatMessage(messages) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(AI_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.response || "I apologize, but I received an empty response. Please try again.",
      toolName: data.toolName || null,
      toolResult: data.toolResult || null,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw error;
  }
}
