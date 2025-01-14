import { ChatMessage, Role, MessageType } from "../models/ChatCompletion";
import { CustomError } from "./CustomError";
 
export class ChatService {
    private static abortController: AbortController | null = null; // AbortController 추가
 
    static async sendMessage(userId: string, messages: ChatMessage[]): Promise<{ answer: string }> {
        const lastMessage = messages[messages.length - 1]; // 마지막 메시지를 가져옴 (사용자 질문)
        const requestBody = {
        question: lastMessage.content, // 백엔드가 기대하는 필드명
        };
 
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/chat/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
 
      if (!response.ok) {
        const err = await response.json();
        throw new CustomError(err.error.message, err);
      }
 
      const data = await response.json(); // { answer: string } 형태의 응답
      return data;
    } catch (error) {
      console.error("Error during sendMessage request:", error);
      throw new CustomError("Failed to send message to backend API.", error);
    }
  }
 
  static async sendMessageStreamed(
    userId: string,
    messages: ChatMessage[],
    callback: (content: string) => void
  ): Promise<void> {
    const requestBody = {
      question: messages[messages.length - 1].content,
    };
 
    const abortController = new AbortController(); // 중단 제어를 위한 AbortController
 
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/chat/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal, // 요청 중단을 위한 signal 추가
      });
 
      if (!response.ok) {
        const err = await response.json();
        throw new CustomError(err.error.message, err);
      }
 
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
 
        let partialDecodedChunk = "";
 
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
 
          let decodedChunk = decoder.decode(value);
          if (partialDecodedChunk) {
            decodedChunk = partialDecodedChunk + decodedChunk;
            partialDecodedChunk = "";
          }
 
          if (decodedChunk.includes("[DONE]")) break;
 
          callback(decodedChunk.trim()); // 실시간으로 스트리밍된 데이터 전달
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("Stream request was aborted.");
      } else {
        console.error("Error during streamed response:", error);
      }
    }
  }
 
  static cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
 
 