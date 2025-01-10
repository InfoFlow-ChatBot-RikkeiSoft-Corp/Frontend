export const OPENAI_ENDPOINT = 'https://api.openai.com';
export const TTS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/audio/speech`;
export const CHAT_COMPLETIONS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/chat/completions`;
export const MODELS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/models`;

export const API_ENDPOINTS = {
    LOGIN: "/login",  // 로그인 엔드포인트
    LOGOUT: "/logout", // 로그아웃 엔드포인트
    SIGNUP: "/signup", // 회원가입 엔드포인트
  };