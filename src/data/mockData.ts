import type { WaterParameter, LogEntry, Station, Camera } from '../types';

function createParameters(baseValues: Record<string, number>): WaterParameter[] {
  const defs: Array<{
    id: string; name: string; unit: string; min: number; max: number;
    warningLow: number; warningHigh: number; criticalLow: number; criticalHigh: number;
    legalLow: number; legalHigh: number;
  }> = [
    { id: 'ph', name: 'pH', unit: '', min: 0, max: 14, warningLow: 6.5, warningHigh: 8.5, criticalLow: 5.5, criticalHigh: 9.5, legalLow: 6.0, legalHigh: 9.0 },
    { id: 'temperature', name: 'Temperature', unit: '°C', min: 0, max: 60, warningLow: 15, warningHigh: 35, criticalLow: 5, criticalHigh: 40, legalLow: 0, legalHigh: 40 },
    { id: 'conductivity', name: 'Conductivity/TDS', unit: 'μS/cm', min: 0, max: 10000, warningLow: 100, warningHigh: 5000, criticalLow: 50, criticalHigh: 8000, legalLow: 0, legalHigh: 5000 },
    { id: 'turbidity', name: 'Turbidity', unit: 'NTU', min: 0, max: 500, warningLow: 0, warningHigh: 50, criticalLow: 0, criticalHigh: 100, legalLow: 0, legalHigh: 100 },
    { id: 'do', name: 'DO', unit: 'mg/L', min: 0, max: 20, warningLow: 5, warningHigh: 14, criticalLow: 2, criticalHigh: 16, legalLow: 2, legalHigh: 20 },
    { id: 'cod', name: 'COD', unit: 'mg/L', min: 0, max: 1000, warningLow: 0, warningHigh: 80, criticalLow: 0, criticalHigh: 120, legalLow: 0, legalHigh: 120 },
    { id: 'bod5', name: 'BOD5', unit: 'mg/L', min: 0, max: 500, warningLow: 0, warningHigh: 15, criticalLow: 0, criticalHigh: 20, legalLow: 0, legalHigh: 20 },
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
  ph: 7.2, temperature: 28.5, conductivity: 1850, turbidity: 35, do: 6.8, cod: 65, bod5: 12,
});

export const station2Parameters = createParameters({
  ph: 6.9, temperature: 30.1, conductivity: 2200, turbidity: 48, do: 5.2, cod: 95, bod5: 18,
});

export const stations: Station[] = [
  {
    id: 'stn-001',
    name: 'Station A - Factory Effluent Point 1',
    location: 'Amata City Industrial Estate, Rayong (Zone A)',
    coordinates: { lat: 12.7891, lng: 101.1352 },
    status: 'online',
    lastSync: new Date(),
    parameters: station1Parameters,
    alerts: [
      { id: 'a1', timestamp: new Date(Date.now() - 300000), parameter: 'COD', message: 'COD level approaching warning threshold', severity: 'warning', value: 65, threshold: 80, acknowledged: false },
      { id: 'a2', timestamp: new Date(Date.now() - 1800000), parameter: 'DO', message: 'DO level slightly below optimal', severity: 'warning', value: 6.8, threshold: 5, acknowledged: true },
    ],
    uptime: 99.2,
  },
  {
    id: 'stn-002',
    name: 'Station B - Factory Effluent Point 2',
    location: 'Amata City Industrial Estate, Rayong (Zone B)',
    coordinates: { lat: 12.7856, lng: 101.1401 },
    status: 'online',
    lastSync: new Date(),
    parameters: station2Parameters,
    alerts: [
      { id: 'a3', timestamp: new Date(Date.now() - 120000), parameter: 'BOD5', message: 'BOD5 approaching critical threshold', severity: 'critical', value: 18, threshold: 20, acknowledged: false },
      { id: 'a4', timestamp: new Date(Date.now() - 600000), parameter: 'Turbidity', message: 'Turbidity elevated above normal', severity: 'warning', value: 48, threshold: 50, acknowledged: false },
      { id: 'a5', timestamp: new Date(Date.now() - 900000), parameter: 'COD', message: 'COD spike detected', severity: 'warning', value: 95, threshold: 80, acknowledged: false },
    ],
    uptime: 97.8,
  },
];

export const logEntries: LogEntry[] = [
  { id: 'l1', timestamp: new Date(Date.now() - 60000), parameter: 'pH', value: 7.2, unit: '', status: 'normal', stationId: 'stn-001' },
  { id: 'l2', timestamp: new Date(Date.now() - 120000), parameter: 'COD', value: 95, unit: 'mg/L', status: 'warning', stationId: 'stn-002' },
  { id: 'l3', timestamp: new Date(Date.now() - 180000), parameter: 'BOD5', value: 18, unit: 'mg/L', status: 'critical', stationId: 'stn-002' },
  { id: 'l4', timestamp: new Date(Date.now() - 240000), parameter: 'Turbidity', value: 48, unit: 'NTU', status: 'warning', stationId: 'stn-002' },
  { id: 'l5', timestamp: new Date(Date.now() - 300000), parameter: 'DO', value: 6.8, unit: 'mg/L', status: 'normal', stationId: 'stn-001' },
  { id: 'l6', timestamp: new Date(Date.now() - 360000), parameter: 'Temperature', value: 28.5, unit: '°C', status: 'normal', stationId: 'stn-001' },
  { id: 'l7', timestamp: new Date(Date.now() - 420000), parameter: 'Conductivity/TDS', value: 2200, unit: 'μS/cm', status: 'warning', stationId: 'stn-002' },
  { id: 'l8', timestamp: new Date(Date.now() - 480000), parameter: 'pH', value: 6.9, unit: '', status: 'normal', stationId: 'stn-002' },
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

export const cameras: Camera[] = [
  {
    id: 'cam-001',
    name: 'CAM-A-01',
    stationId: 'stn-001',
    stationName: 'Station A',
    location: 'Factory Effluent Point 1 - Zone A',
    status: 'online',
    lastSync: new Date(),
  },
  {
    id: 'cam-002',
    name: 'CAM-B-01',
    stationId: 'stn-002',
    stationName: 'Station B',
    location: 'Factory Effluent Point 2 - Zone B',
    status: 'online',
    lastSync: new Date(),
  },
];
