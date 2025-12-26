
export interface Shloka {
  text: string;
  translation: string;
  lastChar: string;
}

export interface GameMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  shloka?: Shloka;
  isValid?: boolean;
  error?: string;
  timestamp: number;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  LOADING = 'LOADING',
  OVER = 'OVER'
}

export interface ValidationResponse {
  isValid: boolean;
  error?: string;
  shlokaDetails?: Shloka;
  aiResponse?: Shloka;
}
