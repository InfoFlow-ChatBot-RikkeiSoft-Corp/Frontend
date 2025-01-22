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
    userId: string,
    conversationId: string,
    messages: ChatMessage[],
    onStreamedResponse: (response: string) => void
  ): Promise<void> {
    // Add debug logging
    console.log("sendMessageStreamed called with:", {
      userId,
      conversationId,
      lastMessage: messages[messages.length - 1]?.content
    });

    const url = `http://127.0.0.1:5000/api/chat/ask`;
    const payload = {
      question: messages[messages.length - 1]?.content || "",
    };

    // Add request tracking to prevent duplicates
    const requestKey = `${conversationId}-${messages.length}`;
    if (ChatService.pendingRequests.has(requestKey)) {
      console.log("Duplicate request detected, skipping:", requestKey);
      return;
    }
    ChatService.pendingRequests.add(requestKey);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", // 기본 헤더 설정
          "conversationId": conversationId, // 예시: 커스텀 헤더 추가 (대화 ID)
          "userId": userId, // 예시: 사용자 ID 추가
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let accumulatedContent = ""; // 스트리밍된 전체 응답을 누적할 변수

        console.log("Streaming response started...");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break; // 스트림이 끝나면 루프를 종료합니다.

          const chunk = decoder.decode(value, { stream: true }); // 청크 데이터를 문자열로 디코딩합니다.
          accumulatedContent += chunk;

          console.log("Received chunk:", chunk);
          onStreamedResponse(accumulatedContent); // 콜백 함수에 누적된 응답을 전달합니다.
        }
        console.log("Streaming response completed.");
      }
    } catch (error) {
      console.error("Error during message streaming:", error);
      throw error;
    } finally {
      // Clean up request tracking
      ChatService.pendingRequests.delete(requestKey);
    }
  }

  // Add static Set to track pending requests
  private static pendingRequests = new Set<string>();
}
