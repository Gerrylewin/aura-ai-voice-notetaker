
export type RecordingState = 'idle' | 'recording' | 'transcribing' | 'analyzing' | 'error';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AIAnalysis {
  summary: string;
  sentiment: string;
  keyTopics: string[];
  actionItems: string[];
  questions: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  transcript: string;
  analysis: AIAnalysis;
  chatHistory: ChatMessage[];
}
