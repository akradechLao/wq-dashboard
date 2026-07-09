import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft, MapPin, Wifi, Clock, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Activity, Droplets, Thermometer, Waves, Zap, Cloud,
} from 'lucide-react';
import type { Station, WaterParameter } from '../../types';
import { generateTrendData, generateHeatmapData } from '../../data/mockData';
import { useMemo } from 'react';

interface StationDetailPageProps {
  station: Station;
  onBack: () => void;
}

const paramIcons: Record<string, typeof Activity> = {
  ph: Droplets, temperature: Thermometer, conductivity: Waves, turbidity: Cloud, do: Activity, cod: Zap, bod5: AlertTriangle,
};

const paramColors: Record<string, string> = {
  ph: '#3b82f6', temperature: '#f59e0b', conductivity: '#06b6d4', turbidity: '#8b5cf6', do: '#10b981', cod: '#ef4444', bod5: '#ec4899',
};

function ParameterDetailCard({ param, index }: { param: WaterParameter; index: number }) {
  const Icon = paramIcons[param.id] || Activity;
  const color = paramColors[param.id] || '#3b82f6';
  const statusConfig = {
    normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Normal' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Warning' },
    critical: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Critical' },
  };
  const s = statusConfig[param.status];

  const gaugeOption = {
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      min: param.min,
      max: param.max,
      radius: '100%',
      progress: { show: true, width: 10, roundCap: true, itemStyle: { color } },
      axisLine: { lineStyle: { width: 10, color: [[1, '#f1f5f9']] }, roundCap: true },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      detail: { valueAnimation: true, fontSize: 22, fontWeight: 700, color, offsetCenter: [0, '5%'], formatter: '{value}' },
      data: [{ value: param.value }],
    }],
  };

  const areaOption = {
    grid: { top: 5, right: 0, bottom: 5, left: 0 },
    xAxis: { type: 'category', show: false, data: param.history.map((_, i) => i) },
    yAxis: { type: 'value', show: false, min: Math.min(...param.history) * 0.85, max: Math.max(...param.history) * 1.15 },
    series: [{
      type: 'line', data: param.history, smooth: true, symbol: 'circle', symbolSize: 6,
      lineStyle: { width: 2.5, color },
      itemStyle: { color, borderColor: '#fff', borderWidth: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + '30' }, { offset: 1, color: 'rgba(255,255,255,0)' }] } },
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-800">{param.name}</span>
            {param.unit && <span className="text-xs text-slate-400 ml-1">{param.unit}</span>}
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
          {s.label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-24">
          <ReactECharts option={gaugeOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        </div>
        <div className="flex-1">
          <div className="h-16">
            <ReactECharts option={areaOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>Min: <span className="font-medium text-slate-600">{Math.min(...param.history).toFixed(1)}</span></span>
          <span>Max: <span className="font-medium text-slate-600">{Math.max(...param.history).toFixed(1)}</span></span>
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${
          param.trend > 0 ? 'text-emerald-600' : param.trend < 0 ? 'text-rose-500' : 'text-slate-400'
        }`}>
          {param.trend > 0 ? <TrendingUp className="w-3 h-3" /> : param.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {Math.abs(param.trend)}%
        </div>
      </div>
    </div>
  );
}

function MultiAxisTrendChart({ station }: { station: Station }) {
  const trendData = useMemo(() => generateTrendData(station.parameters), [station]);

  const lowScaleParams = station.parameters.filter(p => p.max <= 100);
  const highScaleParams = station.parameters.filter(p => p.max > 100);

  const yAxisList = [
    ...(lowScaleParams.length > 0 ? [{
      type: 'value' as const,
      name: 'Low Scale',
      position: 'left' as const,
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      axisLine: { show: true, lineStyle: { color: '#3b82f6' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      axisLabel: { color: '#64748b', fontSize: 9 },
    }] : []),
    ...(highScaleParams.length > 0 ? [{
      type: 'value' as const,
      name: 'High Scale',
      position: 'right' as const,
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      axisLine: { show: true, lineStyle: { color: '#f59e0b' } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#64748b', fontSize: 9 },
    }] : []),
  ];

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 11 },
    },
    legend: {
      data: station.parameters.map(p => p.name),
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 10 },
      itemWidth: 14,
      itemHeight: 3,
    },
    grid: { top: 35, right: 80, bottom: 35, left: 60 },
    xAxis: {
      type: 'category',
      data: trendData.timestamps,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 9, interval: 3 },
    },
    yAxis: yAxisList,
    series: station.parameters.map((p) => {
      const isHighScale = p.max > 100;
      const yAxisIndex = isHighScale ? (lowScaleParams.length > 0 ? 1 : 0) : 0;
      return {
        name: p.name,
        type: 'line',
        yAxisIndex,
        data: trendData.series[p.id],
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: paramColors[p.id] },
        itemStyle: { color: paramColors[p.id] },
        emphasis: { lineStyle: { width: 3 } },
      };
    }),
    animationDuration: 1200,
    animationEasing: 'cubicOut',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">24-Hour Trend Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">Multi-parameter comparison</p>
        </div>
        <div className="flex gap-1.5">
          {['24H', '7D', '30D'].map((p, i) => (
            <button key={p} className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              i === 0 ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}>{p}</button>
          ))}
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 320 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

function CorrelationScatterChart({ station }: { station: Station }) {
  const params = station.parameters;
  const scatterPairs = [
    { x: params.find(p => p.id === 'cod')!, y: params.find(p => p.id === 'bod5')!, xLabel: 'COD', yLabel: 'BOD5' },
    { x: params.find(p => p.id === 'ph')!, y: params.find(p => p.id === 'do')!, xLabel: 'pH', yLabel: 'DO' },
  ];

  const option = {
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 11 },
    },
    grid: [
      { top: 30, right: '52%', bottom: 35, left: 50 },
      { top: 30, right: 30, bottom: 35, left: '55%' },
    ],
    xAxis: scatterPairs.map((pair, i) => ({
      gridIndex: i,
      type: 'value' as const,
      name: pair.xLabel,
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
    })),
    yAxis: scatterPairs.map((pair, i) => ({
      gridIndex: i,
      type: 'value' as const,
      name: pair.yLabel,
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
    })),
    series: scatterPairs.flatMap((pair, i) => [
      {
        type: 'scatter',
        xAxisIndex: i,
        yAxisIndex: i,
        data: pair.x.history.map((v, j) => [v, pair.y.history[j]]),
        symbolSize: 8,
        itemStyle: { color: paramColors[pair.x.id], borderColor: '#fff', borderWidth: 1 },
        emphasis: { itemStyle: { borderColor: '#333', borderWidth: 2 } },
      },
    ]),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Parameter Correlation</h3>
      <p className="text-xs text-slate-400 mb-4">Scatter analysis between related parameters</p>
      <ReactECharts option={option} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

function DistributionBoxPlot({ station }: { station: Station }) {
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 11 },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: station.parameters.map(p => p.name),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: 'Value Range',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
    },
    series: [{
      type: 'boxplot',
      data: station.parameters.map(p => {
        const sorted = [...p.history].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q2 = sorted[Math.floor(sorted.length * 0.5)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        return [min, q1, q2, q3, max];
      }),
      itemStyle: { color: '#dbeafe', borderColor: '#3b82f6', borderWidth: 1.5 },
      emphasis: { itemStyle: { borderColor: '#1d4ed8', borderWidth: 2 } },
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Value Distribution</h3>
      <p className="text-xs text-slate-400 mb-4">Box plot analysis for each parameter</p>
      <ReactECharts option={option} style={{ height: 240 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

function DailyHeatmap() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = generateHeatmapData();

  const option = {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 10 },
      formatter: (p: any) => `${days[p.value[1]]} ${hours[p.value[0]]}<br/>Turbidity: <b>${p.value[2]} NTU</b>`,
    },
    grid: { top: 5, right: 5, bottom: 25, left: 35 },
    xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 8, interval: 3 } },
    yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#94a3b8', fontSize: 9 } },
    visualMap: { min: 0, max: 10, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#eff6ff', '#bfdbfe', '#3b82f6', '#1d4ed8', '#1e3a5f'] }, textStyle: { color: '#94a3b8', fontSize: 9 }, itemWidth: 10, itemHeight: 60 },
    series: [{ type: 'heatmap', data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' } } }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Weekly Heatmap</h3>
      <p className="text-xs text-slate-400 mb-3">Turbidity patterns across the week</p>
      <ReactECharts option={option} style={{ height: 200 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

function RadarComparison({ station }: { station: Station }) {
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#334155', fontSize: 11 },
    },
    radar: {
      indicator: station.parameters.map(p => ({ name: p.name, max: p.max })),
      shape: 'polygon',
      radius: '65%',
      axisName: { color: '#64748b', fontSize: 10 },
      splitArea: { areaStyle: { color: ['rgba(241,245,249,0.4)', 'rgba(241,245,249,0.7)'] } },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: station.parameters.map(p => p.value),
          name: 'Current',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#3b82f6', width: 2 },
          areaStyle: { color: 'rgba(59,130,246,0.2)' },
          itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 2 },
        },
        {
          value: station.parameters.map(p => (p.warningLow + p.warningHigh) / 2),
          name: 'Target',
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: { color: '#10b981', width: 1.5, type: 'dashed' },
          areaStyle: { color: 'rgba(16,185,129,0.08)' },
          itemStyle: { color: '#10b981' },
        },
      ],
    }],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-1">Radar Comparison</h3>
      <p className="text-xs text-slate-400 mb-3">Current vs target levels</p>
      <ReactECharts option={option} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
    </div>
  );
}

export function StationDetailPage({ station, onBack }: StationDetailPageProps) {
  const activeAlerts = station.alerts.filter(a => !a.acknowledged);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{station.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">{station.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Online</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">{station.uptime}% uptime</span>
            </div>
          </div>
        </div>
        {activeAlerts.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">{activeAlerts.length} Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {station.parameters.map((p, i) => (
          <ParameterDetailCard key={p.id} param={p} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-2">
          <MultiAxisTrendChart station={station} />
        </div>
        <RadarComparison station={station} />
        <CorrelationScatterChart station={station} />
        <DistributionBoxPlot station={station} />
        <DailyHeatmap />
      </div>
    </div>
  );
}
