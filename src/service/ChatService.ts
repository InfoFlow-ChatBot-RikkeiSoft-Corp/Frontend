import { modelDetails, OpenAIModel, ModelDetails } from "../models/model";
import { ChatCompletion, ChatCompletionMessage, ChatCompletionRequest, ChatMessage, ChatMessagePart, Role } from "../models/ChatCompletion";
import { OPENAI_API_KEY } from "../config";
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

      this.callDeferred = window.setTimeout(() => {
        callback(this.accumulatedContent); // Pass the accumulated content to the original callback
        this.lastCallbackTime = Date.now();
        this.accumulatedContent = ""; // Reset the accumulated content after the callback is called
      }, delay - timeSinceLastCall < 0 ? 0 : delay - timeSinceLastCall);  // Ensure non-negative delay

      this.lastCallbackTime = timeSinceLastCall < delay ? this.lastCallbackTime : now; // Update last callback time if not within delay
    };
  }

  static async sendMessageStreamed(modelId: string, messages: ChatMessage[], callback: (content: string) => void): Promise<any> {
    const debouncedCallback = this.debounceCallback(callback);
    this.abortController = new AbortController();
    let endpoint = CHAT_COMPLETIONS_ENDPOINT;
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    const requestBody: ChatCompletionRequest = {
      messages: [],
      stream: true,
    };

    const mappedMessages = await ChatService.mapChatMessagesToCompletionMessages(messages);
    requestBody.messages = mappedMessages;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        NotificationService.handleUnexpectedError(error, 'Stream reading was aborted.');
      } else if (error instanceof Error) {
        NotificationService.handleUnexpectedError(error, 'Error reading streamed response.');
      } else {
        console.error('An unexpected error occurred');
      }
      return;
    }

    if (!response.ok) {
      const err = await response.json();
      throw new CustomError(err.error.message, err);
    }

    if (this.abortController.signal.aborted) {
      // todo: propagate to ui?
      console.log('Stream aborted');
      return; // Early return if the fetch was aborted
    }

    if (response.body) {
      // Read the response as a stream of data
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partialDecodedChunk = undefined;
      try {
        while (true) {
          const streamChunk = await reader.read();
          const { done, value } = streamChunk;
          if (done) {
            break;
          }
          let DONE = false;
          let decodedChunk = decoder.decode(value);
          if (partialDecodedChunk) {
            decodedChunk = "data: " + partialDecodedChunk + decodedChunk;
            partialDecodedChunk = undefined;
          }
          const rawData = decodedChunk.split("data: ").filter(Boolean);  // Split on "data: " and remove any empty strings
          const chunks: CompletionChunk[] = rawData.map((chunk, index) => {
            partialDecodedChunk = undefined;
            chunk = chunk.trim();
            if (chunk.length == 0) {
              return;
            }
            if (chunk === '[DONE]') {
              DONE = true;
              return;
            }
            let o;
            try {
              o = JSON.parse(chunk);
            } catch (err) {
              if (index === rawData.length - 1) { // Check if this is the last element
                partialDecodedChunk = chunk;
              } else if (err instanceof Error) {
                console.error(err.message);
              }
            }
            return o;
          }).filter(Boolean); // Filter out undefined values which may be a result of the [DONE] term check

          let accumulatedContent = '';
          chunks.forEach(chunk => {
            chunk.choices.forEach(choice => {
              if (choice.delta && choice.delta.content) {  // Check if delta and content exist
                const content = choice.delta.content;
                try {
                  accumulatedContent += content;
                } catch (err) {
                  if (err instanceof Error) {
                    console.error(err.message);
                  }
                  console.log('error in client. continuing...')
                }
              } else if (choice?.finish_reason === 'stop') {
                // done
              }
            });
          });
          debouncedCallback(accumulatedContent);

          if (DONE) {
            return;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // User aborted the stream, so no need to propagate an error.
        } else if (error instanceof Error) {
          NotificationService.handleUnexpectedError(error, 'Error reading streamed response.');
        } else {
          console.error('An unexpected error occurred');
        }
        return;
      }
    }
  }

  static cancelStream = (): void => {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}