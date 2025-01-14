import { ChatMessage, Role, MessageType } from "../models/ChatCompletion";
import { CustomError } from "./CustomError";
import { CHAT_COMPLETIONS_ENDPOINT, MODELS_ENDPOINT } from "../constants/apiEndpoints";
import { CHAT_STREAM_DEBOUNCE_TIME } from "../constants/appConstants";
import { NotificationService } from './NotificationService';
// Removed import for FileData and FileDataRef

interface CompletionChunk {
  id: string;
  object: string;
  created: number;
  choices: CompletionChunkChoice[];
}

interface CompletionChunkChoice {
  index: number;
  delta: {
    content: string;
  };
  finish_reason: null | string; // If there can be other values than 'null', use appropriate type instead of string.
}

export class ChatService {
  static abortController: AbortController | null = null;

  static async mapChatMessagesToCompletionMessages(messages: ChatMessage[]): Promise<ChatCompletionMessage[]> {

    return messages.map((message) => {
      const contentParts: ChatMessagePart[] = [{
        type: 'text',
        text: message.content
      }];

      // Removed logic for handling fileDataRef

      return {
        role: message.role,
        content: contentParts,
      };
    });
  }

  static async sendMessage(messages: ChatMessage[]): Promise<ChatCompletion> {
    let endpoint = 'http://127.0.0.1:api/chat/{userId}';
    let headers = {
      "Content-Type": "application/json",
    };

    const mappedMessages = await ChatService.mapChatMessagesToCompletionMessages(messages);

    const requestBody: ChatCompletionRequest = {
      messages: mappedMessages,
    };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new CustomError(err.error.message, err);
    }

    return await response.json();
  }

  private static lastCallbackTime: number = 0;
  private static callDeferred: number | null = null;
  private static accumulatedContent: string = ""; // To accumulate content between debounced calls

  static debounceCallback(callback: (content: string) => void, delay: number = CHAT_STREAM_DEBOUNCE_TIME) {
    return (content: string) => {
      this.accumulatedContent += content; // Accumulate content on each call
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallbackTime;

      if (this.callDeferred !== null) {
        clearTimeout(this.callDeferred);
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

    const requestBody: ChatCompletionRequest = {
      messages: [],
      stream: true,
    };

    const mappedMessages = await ChatService.mapChatMessagesToCompletionMessages(messages);
    requestBody.messages = mappedMessages;

    let response: Response;
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