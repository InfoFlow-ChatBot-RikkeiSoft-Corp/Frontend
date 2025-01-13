// AuthService.ts

import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { APP_CONSTANTS } from "../constants/appConstants";

export class AuthService {
  static async login(username: string, password: string): Promise<string> {
    try {
      const response = await axios.post(
        `${APP_CONSTANTS.BASE_URL}${API_ENDPOINTS.LOGIN}`,
        { username, password }
      );
      return response.data.token
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  static saveToken(token: string): void {
    localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, token); // 토큰 저장
  }

  static getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.TOKEN_KEY); // 저장된 토큰 가져오기
  }

  static removeToken(): void {
    localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY); // 토큰 삭제
  }
  static saveId(user_id: string): void {
    localStorage.setItem(APP_CONSTANTS.USER_ID, user_id);
  }
  static getId(): string | null {
    return localStorage.getItem(APP_CONSTANTS.USER_ID);
  }
}