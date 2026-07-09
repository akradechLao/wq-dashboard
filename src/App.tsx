import { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/ui/LoginPage';
import { StationSummaryPage } from './components/dashboard/StationSummaryPage';
import { StationDetailPage } from './components/dashboard/StationDetailPage';
import { AnalyticsPage } from './components/dashboard/AnalyticsPage';
import { AlertsPage } from './components/dashboard/AlertsPage';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { stations as initialStations, cameras } from './data/mockData';
import type { Station } from './types';

import { LayoutDashboard, BarChart3, Bell, Settings, Lock } from 'lucide-react';

type View = { page: 'summary' } | { page: 'detail'; stationId: string };

const DEFAULT_PASSWORD = '1975';

function getPassword(): string {
  return localStorage.getItem('wq_admin_pwd') || DEFAULT_PASSWORD;
}

function MobileBottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 safe-bottom">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'settings-auth');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-primary-600' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.id === 'settings' && <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-1.5 text-slate-300" />}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function App() {
  const [isSettingsAuthed, setIsSettingsAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState(getPassword);
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

  const handleChangePassword = useCallback((newPwd: string) => {
    setAdminPassword(newPwd);
    localStorage.setItem('wq_admin_pwd', newPwd);
  }, []);

  const handleLogout = useCallback(() => {
    setIsSettingsAuthed(false);
    setActiveTab('dashboard');
    setView({ page: 'summary' });
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === 'settings' && !isSettingsAuthed) {
      setActiveTab('settings-auth');
      return;
    }
    setActiveTab(tab);
    if (tab !== 'dashboard') {
      setView({ page: 'summary' });
    }
  }, [isSettingsAuthed]);

  const handleBellClick = useCallback(() => {
    setActiveTab('alerts');
    setView({ page: 'summary' });
  }, []);

  const totalUnread = stationsData.reduce((sum, s) => sum + s.alerts.filter(a => !a.acknowledged).length, 0);

  const handleBackToDashboard = useCallback(() => {
    setActiveTab('dashboard');
  }, []);

  if (activeTab === 'settings-auth') {
    return (
      <LoginPage
        onLogin={() => { setIsSettingsAuthed(true); setActiveTab('settings'); }}
        onBack={handleBackToDashboard}
        storedPassword={adminPassword}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="lg:ml-[220px] ml-0 transition-all duration-300 pb-16 lg:pb-0">
        <Header lastSync={new Date()} unreadCount={totalUnread} stationName={currentStation?.name} onBellClick={handleBellClick} />
        <main className="min-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && view.page === 'summary' && (
            <StationSummaryPage stations={stationsData} onSelectStation={handleSelectStation} cameras={cameras} />
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
            <SettingsPage
              stations={stationsData}
              onUpdateStations={handleUpdateStations}
              onChangePassword={handleChangePassword}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
      <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;
