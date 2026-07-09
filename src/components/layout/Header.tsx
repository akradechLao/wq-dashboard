import { Bell, RefreshCw, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  lastSync: Date;
  unreadCount: number;
  stationName?: string;
}

export function Header({ lastSync, unreadCount, stationName }: HeaderProps) {
  const [syncText, setSyncText] = useState('just now');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const updateSyncText = () => {
      const diff = Math.floor((Date.now() - lastSync.getTime()) / 1000);
      if (diff < 5) setSyncText('just now');
      else if (diff < 60) setSyncText(`${diff}s ago`);
      else setSyncText(`${Math.floor(diff / 60)}m ago`);
    };
    updateSyncText();
    const interval = setInterval(updateSyncText, 1000);
    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 leading-tight">
            Water Quality Live Monitor
          </h1>
          <p className="text-xs text-slate-400">
            {stationName || 'All Stations'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-700">
            Live &bull; Syncing {syncText}
          </span>
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>

        <div className="relative">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
          AD
        </div>
      </div>

      {showSearch && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-3 slide-in-right">
          <input
            type="text"
            placeholder="Search parameters, alerts..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
