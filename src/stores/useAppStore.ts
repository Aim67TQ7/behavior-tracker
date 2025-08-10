import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, BehaviorButton, BehaviorSegment, Session } from '../types';

const defaultButtons: BehaviorButton[] = [
  { id: '1', label: 'Calm', color: '#10b981' },
  { id: '2', label: 'Redirected', color: '#3b82f6' },
  { id: '3', label: 'Escalation', color: '#ef4444' },
  { id: '4', label: 'Transition', color: '#f59e0b' },
  { id: '5', label: 'Break', color: '#8b5cf6' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      isRecording: false,
      activeButtonId: null,
      sessionStartTime: null,
      buttons: defaultButtons,
      view: 'session',

      // Actions
      startSession: () => {
        const newSession: Session = {
          id: Date.now().toString(),
          startTime: new Date(),
          segments: [],
        };
        set({
          currentSession: newSession,
          sessionStartTime: new Date(),
          isRecording: true,
        });
      },

      endSession: () => {
        const { currentSession, sessions, activeButtonId } = get();
        if (!currentSession) return;

        // End the current segment if one is active
        if (activeButtonId && currentSession.segments.length > 0) {
          const lastSegment = currentSession.segments[currentSession.segments.length - 1];
          if (!lastSegment.endTime) {
            lastSegment.endTime = new Date();
            lastSegment.duration = lastSegment.endTime.getTime() - lastSegment.startTime.getTime();
          }
        }

        // Finalize session
        const finalizedSession = {
          ...currentSession,
          endTime: new Date(),
        };

        set({
          currentSession: null,
          sessions: [...sessions, finalizedSession],
          isRecording: false,
          activeButtonId: null,
          sessionStartTime: null,
        });
      },

      switchBehavior: (buttonId: string) => {
        const { currentSession, activeButtonId } = get();
        if (!currentSession || !get().isRecording) return;

        const now = new Date();
        const updatedSegments = [...currentSession.segments];

        // End the current segment if one exists
        if (activeButtonId && updatedSegments.length > 0) {
          const lastSegment = updatedSegments[updatedSegments.length - 1];
          if (!lastSegment.endTime) {
            lastSegment.endTime = now;
            lastSegment.duration = now.getTime() - lastSegment.startTime.getTime();
          }
        }

        // Start a new segment
        const newSegment: BehaviorSegment = {
          buttonId,
          startTime: now,
          duration: 0,
        };
        updatedSegments.push(newSegment);

        set({
          currentSession: {
            ...currentSession,
            segments: updatedSegments,
          },
          activeButtonId: buttonId,
        });
      },

      updateButtons: (buttons: BehaviorButton[]) => {
        set({ buttons });
      },

      setView: (view: 'session' | 'review' | 'reports') => {
        set({ view });
      },

      saveAudioBlob: (blob: Blob) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const audioUrl = URL.createObjectURL(blob);
        set({
          currentSession: {
            ...currentSession,
            audioBlob: blob,
            audioUrl,
          },
        });
      },

      loadSession: (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },
    }),
    {
      name: 'behavior-tracker-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        buttons: state.buttons,
      }),
    }
  )
);