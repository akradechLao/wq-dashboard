import ReactECharts from 'echarts-for-react';
import { BarChart3, Activity } from 'lucide-react';
import type { Station } from '../../types';

interface AnalyticsPageProps {
  stations: Station[];
}

function StationComparisonChart({ stations }: { stations: Station[] }) {
  const paramIds = stations[0]?.parameters.map(p => p.id) || [];
  const paramNames = stations[0]?.parameters.map(p => p.name) || [];

  const normalizedData = stations.map((station, si) => ({
    name: station.name.split(' - ')[0],
    type: 'bar' as const,
    barWidth: '30%',
    data: paramIds.map(pid => {
      const p = station.parameters.find(pp => pp.id === pid);
      if (!p) return 0;
      const range = p.legalHigh - p.legalLow;
      if (range === 0) return 0;
      return Math.round(((p.value - p.legalLow) / range) * 100);
    }),
    itemStyle: {
      color: si === 0 ? '#3b82f6' : '#10b981',
      borderRadius: [4, 4, 0, 0],
    },
    label: {
      show: true,
      position: 'top' as const,
      fontSize: 10,
      fontWeight: 600,
      color: '#475569',
      formatter: (params: any) => {
        const p = station.parameters.find(pp => pp.id === paramIds[params.dataIndex]);
        if (!p) return '';
        return `${p.value}${p.unit ? ' ' + p.unit : ''}`;
      },
    },
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 11 },
      formatter: (params: any) => {
        let html = `<b>${params[0].axisValue}</b><br/>`;
        params.forEach((p: any) => {
          const station = stations.find(s => s.name.split(' - ')[0] === p.seriesName);
          const param = station?.parameters.find(pp => pp.id === paramIds[p.dataIndex]);
          if (param) {
            html += `<span style="color:${p.color}">${p.seriesName}</span>: ${param.value} ${param.unit || ''}<br/>`;
          }
        });
        return html;
      },
    },
    legend: {
      data: stations.map(s => s.name.split(' - ')[0]),
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 10 },
      itemWidth: 14,
      itemHeight: 3,
    },
    grid: { top: 30, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: paramNames,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10, rotate: 15 },
    },
    yAxis: {
      type: 'value',
      name: '% of Legal Limit',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 9, formatter: '{value}%' },
    },
    series: normalizedData,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Station Comparison</h3>
      <p className="text-xs text-slate-400 mb-4">Parameter values across all stations</p>
      <ReactECharts option={option} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

function OverallStatusChart({ stations }: { stations: Station[] }) {
  let normal = 0, warning = 0, critical = 0;
  stations.forEach(s => s.parameters.forEach(p => {
    if (p.status === 'normal') normal++;
    else if (p.status === 'warning') warning++;
    else critical++;
  }));

  const option = {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderWidth: 1, textStyle: { color: '#334155', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      padAngle: 3,
      itemStyle: { borderRadius: 6 },
      label: { show: true, position: 'center', formatter: `{a|${normal + warning + critical}}\n{b|Total}`, rich: { a: { fontSize: 28, fontWeight: 700, color: '#1e293b', lineHeight: 36 }, b: { fontSize: 11, color: '#94a3b8', lineHeight: 20 } } },
      emphasis: { label: { show: true } },
      data: [
        { value: normal, name: 'Normal', itemStyle: { color: '#10b981' } },
        { value: warning, name: 'Warning', itemStyle: { color: '#f59e0b' } },
        { value: critical, name: 'Critical', itemStyle: { color: '#ef4444' } },
      ].filter(d => d.value > 0),
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Overall Status</h3>
      <p className="text-xs text-slate-400 mb-4">Distribution across all parameters</p>
      <ReactECharts option={option} style={{ height: 240 }} opts={{ renderer: 'svg' }} />
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[11px] text-slate-600">Normal ({normal})</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-[11px] text-slate-600">Warning ({warning})</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[11px] text-slate-600">Critical ({critical})</span></div>
      </div>
    </div>
  );
}

function UptimeChart({ stations }: { stations: Station[] }) {
  const option = {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e2e8f0', borderWidth: 1, textStyle: { color: '#334155', fontSize: 11 } },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: stations.map(s => s.name.split(' - ')[0]),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 90,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 9, formatter: '{value}%' },
    },
    series: [{
      type: 'bar',
      data: stations.map(s => ({
        value: s.uptime,
        itemStyle: { color: s.uptime >= 99 ? '#10b981' : s.uptime >= 95 ? '#f59e0b' : '#ef4444', borderRadius: [6, 6, 0, 0] },
      })),
      barWidth: '40%',
      label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11, fontWeight: 600, color: '#475569' },
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Station Uptime</h3>
      <p className="text-xs text-slate-400 mb-4">System availability</p>
      <ReactECharts option={option} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

export function AnalyticsPage({ stations }: AnalyticsPageProps) {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Analytics Overview</h2>
          <p className="text-sm text-slate-400">Cross-station analysis and insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <StationComparisonChart stations={stations} />
        </div>
        <OverallStatusChart stations={stations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UptimeChart stations={stations} />
        <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
          <h3 className="text-base font-semibold text-slate-800 mb-1">Quick Stats</h3>
          <p className="text-xs text-slate-400 mb-4">Summary metrics</p>
          <div className="grid grid-cols-2 gap-3">
            {stations.map(s => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[11px] text-slate-500 mb-1">{s.name.split(' - ')[0]}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-800">{s.parameters.filter(p => p.status === 'normal').length}</span>
                  <span className="text-xs text-slate-400">/ {s.parameters.length} normal</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-slate-500">{s.uptime}% uptime</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
