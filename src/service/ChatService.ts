import { modelDetails, OpenAIModel, ModelDetails } from "../models/model";
import { ChatCompletion, ChatCompletionMessage, ChatCompletionRequest, ChatMessage, ChatMessagePart, Role } from "../models/ChatCompletion";
import { OPENAI_API_KEY } from "../config";
import { CustomError } from "./CustomError";
import { CHAT_COMPLETIONS_ENDPOINT, MODELS_ENDPOINT } from "../constants/apiEndpoints";
import { CHAT_STREAM_DEBOUNCE_TIME } from "../constants/appConstants";
import { NotificationService } from '../service/NotificationService';
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { APP_CONSTANTS } from "../constants/appConstants";

export class ChatService {
  static async sendMessageStreamed(
    model: string,
    messages: ChatMessage[],
    onStreamedResponse: (response: string) => void
  ): Promise<void> {
    const url = `${API_ENDPOINTS.RAG_QUERY}`;
    const payload = {
      query: messages[messages.length - 1]?.content || "",
      retriever_type: "similarity", // 추가 옵션
      k: 5,
      similarity_threshold: 0.7,
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let result = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          result += decoder.decode(value, { stream: true });
          onStreamedResponse(result);
        }
      }
    } catch (error) {
      console.error("Error during message streaming:", error);
      throw error;
    }
  }
}

interface CompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: CompletionChunkChoice[];
}

interface CompletionChunkChoice {
  index: number;
  delta: {
    content: string;
  };
  finish_reason: null | string; // If there can be other values than 'null', use appropriate type instead of string.
}
