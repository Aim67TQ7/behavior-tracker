import React from 'react';
import { SessionList } from '../components/SessionList';
import { SessionReport } from '../components/SessionReport';
import { useAppStore } from '../stores/useAppStore';
import { ArrowLeft } from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const { currentSession, setView } = useAppStore();

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Session History</h2>
          <SessionList />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setView('session')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Sessions
          </button>
        </div>

        <SessionReport session={currentSession} />
      </div>
    </div>
  );
};