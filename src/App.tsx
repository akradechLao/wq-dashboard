import { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StationSummaryPage } from './components/dashboard/StationSummaryPage';
import { StationDetailPage } from './components/dashboard/StationDetailPage';
import { AnalyticsPage } from './components/dashboard/AnalyticsPage';
import { AlertsPage } from './components/dashboard/AlertsPage';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { stations as initialStations } from './data/mockData';
import type { Station } from './types';

type View = { page: 'summary' } | { page: 'detail'; stationId: string };

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState<View>({ page: 'summary' });
  const [stationsData, setStationsData] = useState<Station[]>(initialStations);

  const handleSelectStation = useCallback((id: string) => {
    setView({ page: 'detail', stationId: id });
  }, []);

  const handleBack = useCallback(() => {
    setView({ page: 'summary' });
  }, []);

  const currentStation = view.page === 'detail'
    ? stationsData.find(s => s.id === view.stationId)
    : undefined;

  const handleAcknowledgeAlert = useCallback((stationId: string, alertId: string) => {
    setStationsData(prev =>
      prev.map(s => {
        if (s.id !== stationId) return s;
        return {
          ...s,
          alerts: s.alerts.map(a =>
            a.id === alertId ? { ...a, acknowledged: true } : a
          ),
        };
      })
    );
  }, []);

  const handleUpdateStations = useCallback((newStations: Station[]) => {
    setStationsData(newStations);
  }, []);

  const totalUnread = stationsData.reduce((sum, s) => sum + s.alerts.filter(a => !a.acknowledged).length, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-[220px] transition-all duration-300">
        <Header lastSync={new Date()} unreadCount={totalUnread} stationName={currentStation?.name} />
        <main className="min-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && view.page === 'summary' && (
            <StationSummaryPage stations={stationsData} onSelectStation={handleSelectStation} />
          )}
          {activeTab === 'dashboard' && view.page === 'detail' && currentStation && (
            <StationDetailPage station={currentStation} onBack={handleBack} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsPage stations={stationsData} />
          )}
          {activeTab === 'alerts' && (
            <AlertsPage stations={stationsData} onAcknowledge={handleAcknowledgeAlert} />
          )}
          {activeTab === 'settings' && (
            <SettingsPage stations={stationsData} onUpdateStations={handleUpdateStations} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
