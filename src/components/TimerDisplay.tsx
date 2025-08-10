import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';

export const TimerDisplay: React.FC = () => {
  const { sessionStartTime, isRecording } = useAppStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRecording || !sessionStartTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - sessionStartTime.getTime();
      setElapsed(diff);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, sessionStartTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">
        Session Time
      </h2>
      <div className="text-5xl font-mono font-bold">
        {formatTime(elapsed)}
      </div>
    </div>
  );
};