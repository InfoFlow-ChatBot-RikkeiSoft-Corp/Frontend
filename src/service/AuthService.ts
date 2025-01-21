import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { APP_CONSTANTS } from "../constants/appConstants";

export class AuthService {
  // We'll store the current username in a static property (optional)
  static username: string | null = null;

  /**
   * Logs in a user with username & password.
   * Expects the server response to contain { token, user_id }.
   */
  static async login(
    username: string,
    password: string
  ): Promise<{ token: string; user_id: string; is_admin: boolean}> {
    try {
      const response = await axios.post(
        `${APP_CONSTANTS.BASE_URL}${API_ENDPOINTS.LOGIN}`,
        { username, password }
      );

      // Save the username in-memory
      AuthService.username = username;

      // Extract token & user_id from the response
      const { token, user_id, is_admin } = response.data;

      // Return both so the caller can store them
      return { token, user_id, is_admin };
    } catch (error: any) {
      // Forward a more descriptive error message
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  /**
   * Stores the JWT token in localStorage
   */
  static saveToken(token: string): void {
    localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, token);
  }

  /**
   * Retrieves the JWT token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.TOKEN_KEY);
  }

  /**
   * Removes the token from localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY);
  }

  /**
   * Save user ID in localStorage
   */
  static saveId(user_id: string): void {
    localStorage.setItem(APP_CONSTANTS.USER_ID, user_id);
  }

  /**
   * Get user ID from localStorage
   */
  static getId(): string | null {
    return localStorage.getItem(APP_CONSTANTS.USER_ID);
  }

  static saveIsAdmin(isAdmin: boolean): void {
    localStorage.setItem('is_admin', isAdmin ? 'true' : 'false');
  }

  /**
   * Get the cached username (only stored statically, not in localStorage)
   */
  static getUsername(): string | null {
    return AuthService.username;
  }

  /**
   * Logs out by clearing all auth-related data
   */
  static logout(): void {
    AuthService.username = null; // Clear static username
    localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY); 
    localStorage.removeItem(APP_CONSTANTS.USER_ID);
    localStorage.removeItem('is_admin');
  }

  // ===============================
  // Below: prompt API methods
  // (unchanged except for adding error checks)
  // ===============================
  static async getAllPrompts() {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_ALL_PROMPTS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch prompts");
    }
  }

  static async getPrompt(id: number) {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GET_PROMPT}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch prompt");
    }
  }

  static async addPrompt(prompt: {
    prompt_name: string;
    prompt_text: string;
    created_by: string;
  }) {
    try {
      const response = await axios.post(API_ENDPOINTS.ADD_PROMPT, prompt);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to add prompt");
    }
  }

  static async updatePrompt(id: number, prompt: { prompt_text: string; updated_by: string }) {
    try {
      const response = await axios.put(`${API_ENDPOINTS.UPDATE_PROMPT}/${id}`, prompt);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update prompt");
    }
  }

  static async activatePrompt(id: number) {
    try {
      const response = await axios.post(`${API_ENDPOINTS.ACTIVATE_PROMPT}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to activate prompt");
    }
  }
}
