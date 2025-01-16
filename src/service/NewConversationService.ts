import axios from "axios";
import { APP_CONSTANTS } from "../constants/appConstants";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

// NewConversationService
export class NewConversationService {
  static async createNewConversation(userId: string, title: string = "New Conversation"): Promise<{ conversation_id: string }> {
    try {
        console.log(`${APP_CONSTANTS.BASE_URL}${API_ENDPOINTS.NEW_CONVERSATION}`)
      const response = await axios.post(
        `${APP_CONSTANTS.BASE_URL}/${API_ENDPOINTS.NEW_CONVERSATION}`,
        { title }, // Request body
        {
          headers: {
            userId, // Header에 userId 추가
            "Content-Type": "application/json",
          },
        }
      );
    console.log("Response Data:", response);
    // console.log("Conversation ID:", response.data.conversation_id);

    const conversation_id = response.data.conversation_id;
    console.log("Conversation ID:", conversation_id);

      return conversation_id; // { conversation_id: "..." }
    } catch (error: any) {
      console.error("Error creating new conversation:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to create new conversation.");
    }
  }
  static saveConversationId(conversation_id: string): void {
    localStorage.setItem(APP_CONSTANTS.CONVERSATION_ID, conversation_id);
  }
  static getConversationId(): string | null {
    return localStorage.getItem(APP_CONSTANTS.CONVERSATION_ID);
  }
}
