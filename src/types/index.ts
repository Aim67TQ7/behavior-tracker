export interface BehaviorButton {
  id: string;
  label: string;
  color: string;
  icon?: string;
}

export interface BehaviorSegment {
  buttonId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  audioStartTime?: number;
  audioEndTime?: number;
}

export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  segments: BehaviorSegment[];
  audioBlob?: Blob;
  audioUrl?: string;
  notes?: string;
  transcription?: string;
  summary?: string;
}

export interface AppState {
  // Session state
  currentSession: Session | null;
  sessions: Session[];
  isRecording: boolean;
  activeButtonId: string | null;
  sessionStartTime: Date | null;
  
  // UI state
  buttons: BehaviorButton[];
  view: 'session' | 'review' | 'reports';
  
  // Actions
  startSession: () => void;
  endSession: () => void;
  switchBehavior: (buttonId: string) => void;
  updateButtons: (buttons: BehaviorButton[]) => void;
  setView: (view: 'session' | 'review' | 'reports') => void;
  saveAudioBlob: (blob: Blob) => void;
  loadSession: (sessionId: string) => void;
}