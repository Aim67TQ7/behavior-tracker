import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';

export const BehaviorButtons: React.FC = () => {
  const { buttons, activeButtonId, switchBehavior, isRecording, currentSession } = useAppStore();
  const [buttonTimers, setButtonTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isRecording || !activeButtonId) {
      return;
    }

    const interval = setInterval(() => {
      setButtonTimers((prev) => ({
        ...prev,
        [activeButtonId]: (prev[activeButtonId] || 0) + 100,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, activeButtonId]);

  useEffect(() => {
    // Reset timers when session changes
    if (!currentSession) {
      setButtonTimers({});
    }
  }, [currentSession]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${seconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTotalDuration = (buttonId: string) => {
    if (!currentSession) return 0;
    
    const segments = currentSession.segments.filter(s => s.buttonId === buttonId);
    const completedDuration = segments.reduce((acc, seg) => acc + (seg.duration || 0), 0);
    const currentDuration = activeButtonId === buttonId ? (buttonTimers[buttonId] || 0) : 0;
    
    return completedDuration + currentDuration;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {buttons.map((button) => {
        const isActive = activeButtonId === button.id;
        const totalDuration = getTotalDuration(button.id);
        
        return (
          <button
            key={button.id}
            onClick={() => isRecording && switchBehavior(button.id)}
            disabled={!isRecording}
            className={`
              relative p-6 rounded-lg transition-all duration-200 transform
              ${isActive 
                ? 'scale-105 shadow-xl ring-4 ring-opacity-50' 
                : 'hover:scale-102 shadow-md'
              }
              ${!isRecording 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
              }
            `}
            style={{
              backgroundColor: button.color,
              borderColor: button.color,
              ringColor: button.color,
            }}
          >
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-2">{button.label}</h3>
              {totalDuration > 0 && (
                <div className="text-sm opacity-90">
                  {formatDuration(totalDuration)}
                </div>
              )}
            </div>
            {isActive && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};