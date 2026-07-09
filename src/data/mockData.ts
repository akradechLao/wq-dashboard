import type { WaterParameter, LogEntry, Station } from '../types';

function createParameters(baseValues: Record<string, number>): WaterParameter[] {
  const defs: Array<{
    id: string; name: string; unit: string; min: number; max: number;
    warningLow: number; warningHigh: number; criticalLow: number; criticalHigh: number;
  }> = [
    { id: 'ph', name: 'pH', unit: '', min: 0, max: 14, warningLow: 6.5, warningHigh: 8.5, criticalLow: 5.5, criticalHigh: 9.5 },
    { id: 'tds', name: 'TDS', unit: 'mg/L', min: 0, max: 2000, warningLow: 50, warningHigh: 1000, criticalLow: 20, criticalHigh: 1500 },
    { id: 'conductivity', name: 'Conductivity', unit: 'μS/cm', min: 0, max: 5000, warningLow: 100, warningHigh: 2500, criticalLow: 50, criticalHigh: 4000 },
    { id: 'do', name: 'DO', unit: 'mg/L', min: 0, max: 20, warningLow: 5, warningHigh: 14, criticalLow: 3, criticalHigh: 16 },
    { id: 'temperature', name: 'Temperature', unit: '°C', min: 0, max: 50, warningLow: 15, warningHigh: 35, criticalLow: 5, criticalHigh: 40 },
    { id: 'ec', name: 'EC', unit: 'mS/cm', min: 0, max: 10, warningLow: 0.2, warningHigh: 5, criticalLow: 0.1, criticalHigh: 8 },
  ];

  return defs.map(d => {
    const val = baseValues[d.id] ?? 0;
    const history = Array.from({ length: 12 }, () => {
      const r = (Math.random() - 0.5) * (d.warningHigh - d.warningLow) * 0.15;
      return Math.round((val + r) * 100) / 100;
    });
    history.push(val);
    const trend = history.length > 1 ? ((val - history[0]) / history[0]) * 100 : 0;
    let status: WaterParameter['status'] = 'normal';
    if (val <= d.criticalLow || val >= d.criticalHigh) status = 'critical';
    else if (val <= d.warningLow || val >= d.warningHigh) status = 'warning';
    return { ...d, value: val, history, trend: Math.round(trend * 10) / 10, status };
  });
}

export const station1Parameters = createParameters({
  ph: 7.2, tds: 320, conductivity: 580, do: 6.8, temperature: 28.5, ec: 1.2,
});

export const station2Parameters = createParameters({
  ph: 6.9, tds: 485, conductivity: 820, do: 5.2, temperature: 30.1, ec: 1.8,
});

export const stations: Station[] = [
  {
    id: 'stn-001',
    name: 'Station A - River Intake',
    location: 'Chao Phraya River, Bangkok',
    coordinates: { lat: 13.7563, lng: 100.5018 },
    status: 'online',
    lastSync: new Date(),
    parameters: station1Parameters,
    alerts: [
      { id: 'a1', timestamp: new Date(Date.now() - 300000), parameter: 'DO', message: 'DO level approaching warning threshold', severity: 'warning', value: 6.8, threshold: 5, acknowledged: false },
      { id: 'a2', timestamp: new Date(Date.now() - 1800000), parameter: 'Temperature', message: 'Temperature slightly elevated', severity: 'warning', value: 28.5, threshold: 35, acknowledged: true },
    ],
    uptime: 99.2,
  },
  {
    id: 'stn-002',
    name: 'Station B - Treatment Output',
    location: 'Bangna Industrial Estate',
    coordinates: { lat: 13.6612, lng: 100.6428 },
    status: 'online',
    lastSync: new Date(),
    parameters: station2Parameters,
    alerts: [
      { id: 'a3', timestamp: new Date(Date.now() - 120000), parameter: 'DO', message: 'DO dropped below optimal', severity: 'critical', value: 5.2, threshold: 5, acknowledged: false },
      { id: 'a4', timestamp: new Date(Date.now() - 600000), parameter: 'Conductivity', message: 'Conductivity spike detected', severity: 'warning', value: 820, threshold: 2500, acknowledged: false },
    ],
    uptime: 97.8,
  },
];

export const logEntries: LogEntry[] = [
  { id: 'l1', timestamp: new Date(Date.now() - 60000), parameter: 'pH', value: 7.2, unit: '', status: 'normal', stationId: 'stn-001' },
  { id: 'l2', timestamp: new Date(Date.now() - 120000), parameter: 'DO', value: 5.2, unit: 'mg/L', status: 'critical', stationId: 'stn-002' },
  { id: 'l3', timestamp: new Date(Date.now() - 180000), parameter: 'TDS', value: 485, unit: 'mg/L', status: 'normal', stationId: 'stn-002' },
  { id: 'l4', timestamp: new Date(Date.now() - 240000), parameter: 'Temperature', value: 28.5, unit: '°C', status: 'normal', stationId: 'stn-001' },
  { id: 'l5', timestamp: new Date(Date.now() - 300000), parameter: 'Conductivity', value: 820, unit: 'μS/cm', status: 'warning', stationId: 'stn-002' },
  { id: 'l6', timestamp: new Date(Date.now() - 360000), parameter: 'EC', value: 1.2, unit: 'mS/cm', status: 'normal', stationId: 'stn-001' },
  { id: 'l7', timestamp: new Date(Date.now() - 420000), parameter: 'pH', value: 6.9, unit: '', status: 'normal', stationId: 'stn-002' },
  { id: 'l8', timestamp: new Date(Date.now() - 480000), parameter: 'DO', value: 6.8, unit: 'mg/L', status: 'normal', stationId: 'stn-001' },
];

export function generateTrendData(stationParams: WaterParameter[]) {
  const timestamps = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - (23 - i));
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const series: Record<string, number[]> = {};
  stationParams.forEach(p => {
    series[p.id] = Array.from({ length: 24 }, (_, i) => {
      const base = p.history[i % p.history.length];
      return Math.round((base + (Math.random() - 0.5) * (p.warningHigh - p.warningLow) * 0.1) * 100) / 100;
    });
  });

  return { timestamps, series };
}

export function generateHeatmapData() {
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => [hour, day, Math.round(Math.random() * 10 * 10) / 10])
  ).flat();
}
