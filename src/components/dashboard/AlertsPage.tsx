import { AlertTriangle, AlertCircle, CheckCircle2, Clock, Bell, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Station } from '../../types';

interface AlertsPageProps {
  stations: Station[];
  onAcknowledge: (stationId: string, alertId: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AlertsPage({ stations, onAcknowledge }: AlertsPageProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'critical'>('all');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const sentAlertsRef = useRef<Set<string>>(new Set());

  const allAlerts = stations.flatMap(s =>
    s.alerts.map(a => ({ ...a, stationName: s.name, stationId: s.id }))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filtered = allAlerts.filter(a => {
    if (filter === 'active' && a.acknowledged) return false;
    if (filter === 'acknowledged' && !a.acknowledged) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

  const activeCount = allAlerts.filter(a => !a.acknowledged).length;
  const criticalCount = allAlerts.filter(a => !a.acknowledged && a.severity === 'critical').length;

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const sendAlertsToTelegram = async (alertsToSend?: typeof stations) => {
    setSending(true);
    setSendResult(null);

    const stationsToCheck = alertsToSend || stations;

    try {
      let totalSent = 0;

      for (const station of stationsToCheck) {
        const activeAlerts = station.alerts.filter(a => {
          if (a.acknowledged) return false;
          const alertKey = `${station.id}-${a.id}`;
          if (sentAlertsRef.current.has(alertKey)) return false;
          return true;
        });
        
        if (activeAlerts.length === 0) continue;

        const parameters = activeAlerts.map(alert => ({
          id: alert.parameter.toLowerCase().replace(/\s+/g, ''),
          value: alert.value,
        }));

        console.log('Sending alerts to Telegram:', { stationName: station.name, parameters });

        const response = await fetch(`${API_BASE_URL}/api/alerts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            stationId: station.id,
            stationName: station.name,
            parameters,
          }),
        });

        const data = await response.json();
        console.log('Telegram response:', data);
        
        if (data.success) {
          totalSent += data.alertsSent;
          activeAlerts.forEach(a => {
            sentAlertsRef.current.add(`${station.id}-${a.id}`);
          });
        }
      }

      if (totalSent > 0) {
        setSendResult(`Auto-sent ${totalSent} alert(s) to Telegram`);
        setTimeout(() => setSendResult(null), 3000);
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      setSendResult('Error: Could not connect to server');
      setTimeout(() => setSendResult(null), 3000);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    console.log('AlertsPage loaded, checking for alerts...');
    const hasUnsentAlerts = stations.some(s => 
      s.alerts.some(a => {
        if (a.acknowledged) return false;
        const alertKey = `${s.id}-${a.id}`;
        return !sentAlertsRef.current.has(alertKey);
      })
    );

    console.log('Has unsent alerts:', hasUnsentAlerts);
    console.log('Stations:', stations.map(s => ({ name: s.name, alerts: s.alerts.length })));

    if (hasUnsentAlerts && !sending) {
      sendAlertsToTelegram();
    }
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Alert Center</h2>
            <p className="text-sm text-slate-400">Monitor and manage all alerts</p>
          </div>
        </div>
        <button
          onClick={() => sendAlertsToTelegram()}
          disabled={sending || activeCount === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            sending || activeCount === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Send className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
          {sending ? 'Sending...' : 'Send to Telegram'}
        </button>
      </div>

      {sendResult && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          sendResult.startsWith('Error') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {sendResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
            <p className="text-xs text-slate-400">Active Alerts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{criticalCount}</p>
            <p className="text-xs text-slate-400">Critical Alerts</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{allAlerts.length - activeCount}</p>
            <p className="text-xs text-slate-400">Resolved</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(['all', 'active', 'acknowledged'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(['all', 'warning', 'critical'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                severityFilter === s
                  ? s === 'critical' ? 'bg-rose-50 text-rose-600' : s === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.map((alert) => (
            <div
              key={`${alert.stationId}-${alert.id}`}
              className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50/50 ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.severity === 'critical' ? (
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {alert.parameter}
                  </span>
                  <span className="text-[10px] text-slate-400">{alert.stationName}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">
                    Value: <span className="font-medium text-slate-600">{alert.value}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Threshold: <span className="font-medium text-slate-600">{alert.threshold}</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatTime(alert.timestamp)}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {alert.acknowledged ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </div>
                ) : (
                  <button
                    onClick={() => onAcknowledge(alert.stationId, alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-400" />
              <p className="text-sm font-medium">No alerts matching filters</p>
              <p className="text-xs mt-1">All clear!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
