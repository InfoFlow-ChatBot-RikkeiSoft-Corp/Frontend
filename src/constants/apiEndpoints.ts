export const OPENAI_ENDPOINT = 'https://api.openai.com';
export const TTS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/audio/speech`;
export const CHAT_COMPLETIONS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/chat/completions`;
export const MODELS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/models`;
export const API_AUTH_BASE_URL = 'http://127.0.0.1:5000/api/auth';
export const API_FILES_BASE_URL = 'http://127.0.0.1:5000/api/files';
export const LOGIN = `${API_AUTH_BASE_URL}/login`;
export const GOOGLE_LOGIN = `${API_AUTH_BASE_URL}/google-login`;
export const UPLOAD = `${API_FILES_BASE_URL}/upload`;
export const DELETE = `${API_FILES_BASE_URL}/delete`;
export const LIST_FILES =`${API_FILES_BASE_URL}/list_files`;

export const API_ENDPOINTS = {
    LOGIN: '/api/auth/login', // 올바른 경로
    LOGOUT: '/api/auth/logout',
    SIGNIN: '/api/auth/google-login',
    RAG_QUERY: "/api/rag/query",
    CHAT: '/api/chat',
    UPLOAD_FILE: '/api/files/upload',
    LIST_FILES: '/api/files/list_files',
    DELETE_FILE: '/api/files/delete'
  };