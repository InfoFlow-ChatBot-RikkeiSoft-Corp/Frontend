import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { APP_CONSTANTS } from "../constants/appConstants";

export class AuthService {
    static username: string | null = null;

    static async login(username: string, password: string): Promise<string> {
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

    static logout(): void {
        AuthService.username = null; // Clear static username
        localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY); // Remove token
    }
}
