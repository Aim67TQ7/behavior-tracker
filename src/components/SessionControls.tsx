import React from 'react';
import { Play, Square, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export const SessionControls: React.FC = () => {
  const { isRecording, startSession, endSession } = useAppStore();
  const { isRecordingAudio, startRecording, stopRecording } = useAudioRecorder();

  const handleStartSession = () => {
    startSession();
    startRecording();
  };

  const handleEndSession = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      useAppStore.getState().saveAudioBlob(audioBlob);
    }
    endSession();
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {!isRecording ? (
        <button
          onClick={handleStartSession}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Play size={20} />
          Start Session
        </button>
      ) : (
        <>
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Square size={20} />
            End Session
          </button>
          <div className="flex items-center gap-2 text-gray-600">
            {isRecordingAudio ? (
              <>
                <Mic className="text-red-500 animate-pulse" size={20} />
                <span className="text-sm">Recording...</span>
              </>
            ) : (
              <>
                <MicOff className="text-gray-400" size={20} />
                <span className="text-sm">Not Recording</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};