import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Timer, FileText, BarChart2 } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { view, setView, isRecording } = useAppStore();

  const navItems = [
    { id: 'session', label: 'Session', icon: Timer },
    { id: 'review', label: 'Review', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
  ] as const;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-900">Behavior Tracker</h1>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              const isDisabled = isRecording && item.id !== 'session';
              
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && setView(item.id as any)}
                  disabled={isDisabled}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};