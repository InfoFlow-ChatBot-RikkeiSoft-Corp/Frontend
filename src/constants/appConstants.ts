export const SNIPPET_MARKERS = {
  begin: '----BEGIN-SNIPPET----',
  end: '----END-SNIPPET----',
};

export const MAX_ROWS = 20;
export const MAX_TITLE_LENGTH = 128;

export const CHAT_STREAM_DEBOUNCE_TIME = 250;
export const DEFAULT_MODEL = 'gpt-4o';
export const DEFAULT_INSTRUCTIONS = 'You are a helpful assistant.';


export const CONVERSATION_NOT_FOUND = 'conversation-not-found';

export const IMAGE_MAX_ZOOM = 2; // 200%
export const MAX_IMAGE_ATTACHMENTS_PER_MESSAGE = 10;
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const TEXT_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'text/xml',
  'application/json',
  'text/markdown'
];

// appConstants.ts

export const APP_CONSTANTS = {
  TOKEN_KEY: "auth_token", // 로컬 스토리지에 저장될 JWT 키
  USER_ID: "user_id",
  BASE_URL: "http://127.0.0.1:5000", // Flask 백엔드의 기본 URL
  TOKEN_EXPIRATION: 3600, // 토큰 만료 시간 (초 단위)
};
