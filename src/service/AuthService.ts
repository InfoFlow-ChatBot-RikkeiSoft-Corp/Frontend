import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { APP_CONSTANTS } from "../constants/appConstants";

export class AuthService {
    static username: string | null = null;

    static async login(username: string, password: string): Promise<{ token: string; user_id: string }> {
        try {
            const response = await axios.post(
                `${APP_CONSTANTS.BASE_URL}${API_ENDPOINTS.LOGIN}`,
                { username, password }
            );

            // Save username statically
            AuthService.username = username;

            return response.data.token;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Login failed");
        }
    }

    static saveToken(token: string): void {
        localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, token); // Save token
    }

    static getToken(): string | null {
        return localStorage.getItem(APP_CONSTANTS.TOKEN_KEY); // Retrieve saved token
    }

    static getUsername(): string | null {
        return AuthService.username; // Retrieve static username
    }

    static removeToken(): void {
        localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY); // Remove token
    }

    static saveId(user_id: string): void {
        localStorage.setItem(APP_CONSTANTS.USER_ID, user_id);
    }

    static logout(): void {
        AuthService.username = null; // Clear static username
        localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY); // Remove token
    }

    static getId(): string | null {
        return localStorage.getItem(APP_CONSTANTS.USER_ID);
    }

    // New methods for prompt APIs
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

    static async addPrompt(prompt: { prompt_name: string; prompt_text: string; created_by: string }) {
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