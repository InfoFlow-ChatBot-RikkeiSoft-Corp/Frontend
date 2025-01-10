// AuthService.ts

import axios from "axios";
import { API_ENDPOINTS } from "./apiEndpoints";
import { APP_CONSTANTS } from "./appConstants";

export class AuthService {
  // 로그인
  static async login(username: string, password: string): Promise<void> {
    try {
      const response = await axios.post(`${APP_CONSTANTS.BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        username,
        password,
      });

      const { token } = response.data;
      localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, token); // JWT 저장
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "로그인 실패");
    }
  }

  // 로그아웃
  static logout(): void {
    localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY); // JWT 삭제
  }

  // 토큰 가져오기
  static getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.TOKEN_KEY);
  }

  // 인증 여부 확인
  static isAuthenticated(): boolean {
    return !!this.getToken(); // 토큰 존재 여부로 인증 상태 확인
  }
}
