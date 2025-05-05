
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import SideNavigation from './components/SideNavigation';
import Dashboard from './pages/Dashboard';
import OccurrenceAnalysis from './pages/OccurrenceAnalysis';
import InvestigationReport from './pages/InvestigationReport';
import LinkAnalysis from './pages/LinkAnalysis';
import AudioAnalysis from './pages/AudioAnalysis';
import ImageAnalysis from './pages/ImageAnalysis';
import CaseManagement from './pages/CaseManagement';
import Settings from './pages/Settings';
import { CaseProvider } from './contexts/CaseContext';
import './index.css';

function App() {
  return (
    <CaseProvider>
      <Router>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
          <SideNavigation />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/occurrence-analysis" element={<OccurrenceAnalysis />} />
              <Route path="/investigation-report" element={<InvestigationReport />} />
              <Route path="/link-analysis" element={<LinkAnalysis />} />
              <Route path="/audio-analysis" element={<AudioAnalysis />} />
              <Route path="/image-analysis" element={<ImageAnalysis />} />
              <Route path="/case-management" element={<CaseManagement />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
        <Toaster />
      </Router>
    </CaseProvider>
  );
}

export default App;
