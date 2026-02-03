
export enum AppTab {
  DASHBOARD = 'dashboard',
  IMAGE_STUDIO = 'image_studio',
  AI_PHOTOSHOP = 'ai_photoshop',
  VIDEO_STUDIO = 'video_studio',
  LIVE_VOICE = 'live_voice',
  AI_CHAT = 'ai_chat',
  AUDIO_HUB = 'audio_hub',
  CONCEPT_TO_PROD = 'concept_to_prod',
  AUTO_DOC = 'auto_doc',
  MARKETING_SUITE = 'marketing_suite',
  OMNI_SEARCH = 'omni_search',
  SMART_DUBBING = 'smart_dubbing',
  STORYBOARD = 'storyboard'
}

export type Language = 'en' | 'ru';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  groundingLinks?: Array<{ title: string; uri: string }>;
  thinking?: string;
}

export interface ImageOperation {
  id: string;
  type: 'generation' | 'edit' | 'analysis';
  input?: string;
  output?: string;
  prompt?: string;
  timestamp: number;
}

export interface VideoOperation {
  id: string;
  type: 'generation' | 'translation' | 'analysis' | 'extension';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  prompt?: string;
  timestamp: number;
  originalOperation?: any;
}
