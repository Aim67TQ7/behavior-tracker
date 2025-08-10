import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { format } from 'date-fns';
import { Calendar, Clock, FileText } from 'lucide-react';

export const SessionList: React.FC = () => {
  const { sessions, loadSession, setView } = useAppStore();

  const handleViewSession = (sessionId: string) => {
    loadSession(sessionId);
    setView('review');
  };

  const calculateSessionDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return 'In Progress';
    const duration = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No sessions recorded yet. Start a new session to begin tracking behaviors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleViewSession(session.id)}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="text-sm">
                  {format(new Date(session.startTime), 'MMM dd, yyyy')}
                </span>
                <Clock size={16} className="ml-4" />
                <span className="text-sm">
                  {format(new Date(session.startTime), 'HH:mm')}
                </span>
              </div>
              <div className="text-lg font-semibold">
                Session #{session.id.slice(-6)}
              </div>
              <div className="text-sm text-gray-600">
                Duration: {calculateSessionDuration(new Date(session.startTime), session.endTime ? new Date(session.endTime) : undefined)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {session.transcription && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <FileText size={16} />
                  <span>Transcribed</span>
                </div>
              )}
              {session.summary && (
                <div className="flex items-center gap-1 text-blue-600 text-sm">
                  <FileText size={16} />
                  <span>Summary Available</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            {Array.from(new Set(session.segments.map(s => s.buttonId))).map(buttonId => {
              const button = useAppStore.getState().buttons.find(b => b.id === buttonId);
              if (!button) return null;
              return (
                <span
                  key={buttonId}
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: button.color }}
                >
                  {button.label}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};