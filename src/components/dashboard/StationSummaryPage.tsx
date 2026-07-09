import ReactECharts from 'echarts-for-react';
import { MapPin, Activity, AlertTriangle, Clock, TrendingUp, TrendingDown, Minus, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import type { Station, WaterParameter } from '../../types';

interface StationSummaryPageProps {
  stations: Station[];
  onSelectStation: (id: string) => void;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const option = {
    grid: { top: 2, right: 0, bottom: 2, left: 0 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false, min: Math.min(...data) * 0.9, max: Math.max(...data) * 1.1 },
    series: [{
      type: 'line', data: data, smooth: true, symbol: 'none',
      lineStyle: { width: 1.5, color },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + '40' }, { offset: 1, color: 'rgba(255,255,255,0)' }] } },
    }],
  };
  return <ReactECharts option={option} style={{ height: 40, width: '100%' }} opts={{ renderer: 'svg' }} />;
}

function ParamMiniCard({ param }: { param: WaterParameter }) {
  const statusColors: Record<string, { dot: string; bg: string; text: string; line: string }> = {
    normal: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', line: '#10b981' },
    warning: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', line: '#f59e0b' },
    critical: { dot: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700', line: '#ef4444' },
  };
  const c = statusColors[param.status];

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-lg ${c.bg} border border-transparent hover:border-slate-200 transition-all`}>
      <div className={`w-1.5 h-8 rounded-full ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">{param.name}</span>
          {param.unit && <span className="text-[9px] text-slate-400">{param.unit}</span>}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-slate-800 tabular-nums">{param.value.toFixed(1)}</span>
          <span className={`flex items-center text-[10px] font-medium ${
            param.trend > 0 ? 'text-emerald-600' : param.trend < 0 ? 'text-rose-500' : 'text-slate-400'
          }`}>
            {param.trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : param.trend < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
            {Math.abs(param.trend)}%
          </span>
        </div>
      </div>
      <div className="w-16">
        <MiniSparkline data={param.history} color={c.line} />
      </div>
    </div>
  );
}

export function StationSummaryPage({ stations, onSelectStation }: StationSummaryPageProps) {
  const totalAlerts = stations.reduce((sum, s) => sum + s.alerts.filter(a => !a.acknowledged).length, 0);
  const totalParams = stations.reduce((sum, s) => sum + s.parameters.filter(p => p.status === 'normal').length, 0);
  const totalParamCount = stations.reduce((sum, s) => sum + s.parameters.length, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Monitoring Stations</h2>
          <p className="text-sm text-slate-400 mt-0.5">Overview of all installation points</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              {stations.filter(s => s.status === 'online').length} Online
            </span>
          </div>
          {totalAlerts > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-700">{totalAlerts} Active Alerts</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalParamCount}</p>
            <p className="text-xs text-slate-400">Parameters Monitored</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalParams}/{totalParamCount}</p>
            <p className="text-xs text-slate-400">Within Normal Range</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalAlerts}</p>
            <p className="text-xs text-slate-400">Unresolved Alerts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {stations.map((station, idx) => {
          const normalCount = station.parameters.filter(p => p.status === 'normal').length;
          const healthPct = Math.round((normalCount / station.parameters.length) * 100);

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 group fade-in"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    station.status === 'online' ? 'bg-emerald-50' : 'bg-slate-100'
                  }`}>
                    {station.status === 'online' ? (
                      <Wifi className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                      {station.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{station.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{station.uptime}% uptime</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${healthPct}%`,
                      backgroundColor: healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600">{healthPct}%</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {station.parameters.slice(0, 4).map(p => (
                  <ParamMiniCard key={p.id} param={p} />
                ))}
              </div>

              {station.parameters.length > 4 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {station.parameters.slice(4).map(p => (
                    <ParamMiniCard key={p.id} param={p} />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {station.alerts.filter(a => !a.acknowledged).length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {station.alerts.filter(a => !a.acknowledged).length} alerts
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    Last sync: {station.lastSync.toLocaleTimeString()}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                  View Details
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
