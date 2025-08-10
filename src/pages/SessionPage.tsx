import React from 'react';
import { TimerDisplay } from '../components/TimerDisplay';
import { BehaviorButtons } from '../components/BehaviorButtons';
import { SessionControls } from '../components/SessionControls';
import { useAppStore } from '../stores/useAppStore';

export const SessionPage: React.FC = () => {
  const { isRecording } = useAppStore();

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="space-y-8">
          {/* Timer Display */}
          <div className="flex justify-center">
            <TimerDisplay />
          </div>

          {/* Session Controls */}
          <div className="flex justify-center">
            <SessionControls />
          </div>

          {/* Behavior Buttons */}
          {isRecording && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Select Active Behavior
              </h2>
              <BehaviorButtons />
            </div>
          )}

          {/* Instructions */}
          {!isRecording && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-800">
                Press "Start Session" to begin tracking behaviors. Voice recording will start automatically
                when you select your first behavior.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};