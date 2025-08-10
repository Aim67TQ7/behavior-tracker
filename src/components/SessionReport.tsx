import React, { useState } from 'react';
import { Session } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { format } from 'date-fns';
import { exportToCSV, exportToJSON, generatePDFReport } from '../utils/exportUtils';
import { processSession } from '../services/aiService';
import { Download, FileText, FileJson, Sparkles, Loader2 } from 'lucide-react';

interface SessionReportProps {
  session: Session;
}

export const SessionReport: React.FC<SessionReportProps> = ({ session }) => {
  const { buttons } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSession, setProcessedSession] = useState(session);

  const handleExportPDF = async () => {
    await generatePDFReport(processedSession, buttons, 'session-report');
  };

  const handleExportCSV = () => {
    exportToCSV(processedSession, buttons);
  };

  const handleExportJSON = () => {
    exportToJSON(processedSession, buttons);
  };

  const handleProcessWithAI = async () => {
    if (!session.audioBlob) {
      alert('No audio recording available for this session');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processSession(session.audioBlob, {
        segments: session.segments,
        buttons
      });

      const updatedSession = {
        ...session,
        transcription: result.transcription,
        summary: result.summary
      };

      setProcessedSession(updatedSession);
      
      // Update the session in the store
      const sessions = useAppStore.getState().sessions;
      const updatedSessions = sessions.map(s => 
        s.id === session.id ? updatedSession : s
      );
      useAppStore.setState({ sessions: updatedSessions });
    } catch (error) {
      console.error('Error processing session:', error);
      alert('Failed to process session with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateBehaviorStats = () => {
    const stats: Record<string, { duration: number; count: number }> = {};
    session.segments.forEach(segment => {
      if (!stats[segment.buttonId]) {
        stats[segment.buttonId] = { duration: 0, count: 0 };
      }
      stats[segment.buttonId].duration += segment.duration || 0;
      stats[segment.buttonId].count += 1;
    });
    return stats;
  };

  const totalDuration = session.endTime 
    ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    : 0;

  const stats = calculateBehaviorStats();

  return (
    <div id="session-report" className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">Behavioral Observation Report</h2>
          <p className="text-gray-600">Session #{session.id.slice(-6)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText size={18} />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FileJson size={18} />
            JSON
          </button>
          {!processedSession.transcription && session.audioBlob && (
            <button
              onClick={handleProcessWithAI}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Process with AI
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Date</h3>
          <p className="text-lg">{format(new Date(session.startTime), 'MMM dd, yyyy')}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Start Time</h3>
          <p className="text-lg">{format(new Date(session.startTime), 'HH:mm:ss')}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Duration</h3>
          <p className="text-lg">{Math.floor(totalDuration / 60000)} minutes</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600 uppercase">Transitions</h3>
          <p className="text-lg">{session.segments.length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Behavior Summary</h3>
        <div className="space-y-4">
          {Object.entries(stats).map(([buttonId, data]) => {
            const button = buttons.find(b => b.id === buttonId);
            if (!button) return null;
            const percentage = (data.duration / totalDuration) * 100;

            return (
              <div key={buttonId} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: button.color }}
                  >
                    {button.label}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold">{percentage.toFixed(1)}% of session</p>
                    <p className="text-sm text-gray-600">
                      {Math.floor(data.duration / 1000)}s total ({data.count} occurrences)
                    </p>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: button.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Behavior Timeline</h3>
        <div className="space-y-2">
          {session.segments.map((segment, index) => {
            const button = buttons.find(b => b.id === segment.buttonId);
            if (!button) return null;

            return (
              <div key={index} className="flex items-center gap-4 text-sm">
                <span className="text-gray-500 w-20">
                  {format(segment.startTime, 'HH:mm:ss')}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: button.color }}
                >
                  {button.label}
                </span>
                <span className="text-gray-600">
                  {Math.floor((segment.duration || 0) / 1000)}s
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {processedSession.summary && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-wrap">{processedSession.summary}</p>
          </div>
        </div>
      )}

      {processedSession.transcription && (
        <div>
          <h3 className="text-xl font-bold mb-4">Session Transcription</h3>
          <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{processedSession.transcription}</p>
          </div>
        </div>
      )}
    </div>
  );
};