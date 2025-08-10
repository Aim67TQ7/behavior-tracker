import React from 'react';
import { SessionPage } from './pages/SessionPage';
import { ReviewPage } from './pages/ReviewPage';
import { Navigation } from './components/Navigation';
import { useAppStore } from './stores/useAppStore';

function App() {
  const { view } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {view === 'session' && <SessionPage />}
      {view === 'review' && <ReviewPage />}
      {view === 'reports' && (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Reports feature coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;