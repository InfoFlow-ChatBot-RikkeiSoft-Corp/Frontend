export const OPENAI_ENDPOINT = 'https://api.openai.com';
export const TTS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/audio/speech`;
export const CHAT_COMPLETIONS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/chat/completions`;
export const MODELS_ENDPOINT = `${OPENAI_ENDPOINT}/v1/models`;

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