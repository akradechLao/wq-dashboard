export type ParameterStatus = 'normal' | 'warning' | 'critical';

export interface WaterParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  warningLow: number;
  warningHigh: number;
  criticalLow: number;
  criticalHigh: number;
  legalLow: number;
  legalHigh: number;
  trend: number;
  history: number[];
  status: ParameterStatus;
}

export interface Station {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'online' | 'offline' | 'maintenance';
  lastSync: Date;
  parameters: WaterParameter[];
  alerts: Alert[];
  uptime: number;
}

export interface Alert {
  id: string;
  timestamp: Date;
  parameter: string;
  message: string;
  severity: 'warning' | 'critical';
  value: number;
  threshold: number;
  acknowledged: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  parameter: string;
  value: number;
  unit: string;
  status: ParameterStatus;
  stationId: string;
}
