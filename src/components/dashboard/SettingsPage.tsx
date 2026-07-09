import { useState } from 'react';
import {
  Settings, Plus, Trash2, Save, X, MapPin, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, Edit3, Copy, Wifi, WifiOff, Lock, Eye, EyeOff, LogOut,
} from 'lucide-react';
import type { Station, WaterParameter } from '../../types';

interface SettingsPageProps {
  stations: Station[];
  onUpdateStations: (stations: Station[]) => void;
  onChangePassword: (newPassword: string) => void;
  onLogout: () => void;
}

const defaultParamDefs = [
  { id: 'ph', name: 'pH', unit: '', min: 0, max: 14, legalLow: 6.5, legalHigh: 8.5 },
  { id: 'tds', name: 'TDS', unit: 'mg/L', min: 0, max: 2000, legalLow: 0, legalHigh: 1000 },
  { id: 'conductivity', name: 'Conductivity', unit: 'μS/cm', min: 0, max: 5000, legalLow: 0, legalHigh: 2500 },
  { id: 'do', name: 'DO', unit: 'mg/L', min: 0, max: 20, legalLow: 5, legalHigh: 14 },
  { id: 'temperature', name: 'Temperature', unit: '°C', min: 0, max: 50, legalLow: 15, legalHigh: 35 },
  { id: 'ec', name: 'EC', unit: 'mS/cm', min: 0, max: 10, legalLow: 0.2, legalHigh: 5 },
];

function StationForm({
  station,
  onSave,
  onCancel,
}: {
  station?: Station;
  onSave: (data: Partial<Station>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(station?.name || '');
  const [location, setLocation] = useState(station?.location || '');
  const [lat, setLat] = useState(station?.coordinates.lat.toString() || '');
  const [lng, setLng] = useState(station?.coordinates.lng.toString() || '');
  const [status, setStatus] = useState<Station['status']>(station?.status || 'online');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 fade-in">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        {station ? 'Edit Station' : 'Add New Station'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Station Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. Station C - Canal Monitor"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. Bangkok, Thailand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={e => setLat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="13.7563"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={e => setLng(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="100.5018"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Station['status'])}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-5">
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSave({
              name: name.trim(),
              location: location.trim(),
              coordinates: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
              status,
            });
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          {station ? 'Save Changes' : 'Add Station'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-slate-500 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

function ParameterEditor({
  station,
  onUpdateStation,
}: {
  station: Station;
  onUpdateStation: (id: string, updates: Partial<Station>) => void;
}) {
  const [editParam, setEditParam] = useState<WaterParameter | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSaveParam = (param: WaterParameter) => {
    const exists = station.parameters.find(p => p.id === param.id);
    let newParams;
    if (exists) {
      newParams = station.parameters.map(p => p.id === param.id ? { ...p, ...param } : p);
    } else {
      newParams = [...station.parameters, { ...param, history: [param.value], trend: 0, status: 'normal' as const }];
    }
    onUpdateStation(station.id, { parameters: newParams });
    setEditParam(null);
    setShowAdd(false);
  };

  const handleDeleteParam = (id: string) => {
    if (!confirm('Delete this parameter?')) return;
    onUpdateStation(station.id, {
      parameters: station.parameters.filter(p => p.id !== id),
    });
  };

  const handleDuplicateParam = (param: WaterParameter) => {
    const newParam = {
      ...param,
      id: `${param.id}-copy-${Date.now()}`,
      name: `${param.name} (Copy)`,
    };
    handleSaveParam(newParam);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Parameters ({station.parameters.length})</h4>
        <button
          onClick={() => { setShowAdd(true); setEditParam(null); }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Parameter
        </button>
      </div>

      {(showAdd || editParam) && (
        <ParameterForm
          param={editParam || undefined}
          onSave={handleSaveParam}
          onCancel={() => { setEditParam(null); setShowAdd(false); }}
        />
      )}

      {station.parameters.map(p => {
        const isExpanded = expandedId === p.id;
        return (
          <div key={p.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : p.id)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-800">{p.name}</span>
                {p.unit && <span className="text-xs text-slate-400 ml-1">{p.unit}</span>}
              </div>
              <span className="text-xs text-slate-500 tabular-nums">Current: {p.value}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); setEditParam(p); setShowAdd(false); }}
                  className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDuplicateParam(p); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteParam(p.id); }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-3 pt-1 border-t border-slate-100 fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-[10px] text-slate-400 mb-0.5">Range</p>
                    <p className="text-xs font-medium text-slate-700">{p.min} - {p.max}</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <p className="text-[10px] text-amber-600 mb-0.5">Warning Range</p>
                    <p className="text-xs font-medium text-amber-700">{p.warningLow} - {p.warningHigh}</p>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <p className="text-[10px] text-rose-600 mb-0.5">Critical Range</p>
                    <p className="text-xs font-medium text-rose-700">{p.criticalLow} - {p.criticalHigh}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <p className="text-[10px] text-emerald-600 mb-0.5">Legal Standard</p>
                    <p className="text-xs font-medium text-emerald-700">6.5 - 8.5</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {station.parameters.length === 0 && (
        <div className="text-center py-8 text-slate-400 bg-white rounded-lg border border-slate-200 border-dashed">
          <p className="text-sm">No parameters configured</p>
          <p className="text-xs mt-1">Click "Add Parameter" to get started</p>
        </div>
      )}
    </div>
  );
}

function ParameterForm({
  param,
  onSave,
  onCancel,
}: {
  param?: WaterParameter;
  onSave: (data: WaterParameter) => void;
  onCancel: () => void;
}) {
  const [id, setId] = useState(param?.id || '');
  const [name, setName] = useState(param?.name || '');
  const [unit, setUnit] = useState(param?.unit || '');
  const [min, setMin] = useState(param?.min.toString() || '0');
  const [max, setMax] = useState(param?.max.toString() || '100');
  const [warningLow, setWarningLow] = useState(param?.warningLow.toString() || '');
  const [warningHigh, setWarningHigh] = useState(param?.warningHigh.toString() || '');
  const [criticalLow, setCriticalLow] = useState(param?.criticalLow.toString() || '');
  const [criticalHigh, setCriticalHigh] = useState(param?.criticalHigh.toString() || '');
  const [legalLow, setLegalLow] = useState('');
  const [legalHigh, setLegalHigh] = useState('');

  const quickFill = (preset: string) => {
    const def = defaultParamDefs.find(d => d.id === preset);
    if (!def) return;
    setId(def.id);
    setName(def.name);
    setUnit(def.unit);
    setMin(def.min.toString());
    setMax(def.max.toString());
    setWarningLow((def.legalLow * 0.9).toFixed(2));
    setWarningHigh((def.legalHigh * 1.1).toFixed(2));
    setCriticalLow((def.legalLow * 0.7).toFixed(2));
    setCriticalHigh((def.legalHigh * 1.3).toFixed(2));
    setLegalLow(def.legalLow.toString());
    setLegalHigh(def.legalHigh.toString());
  };

  return (
    <div className="bg-white rounded-xl border border-primary-200 p-5 fade-in">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">
        {param ? `Edit: ${param.name}` : 'Add New Parameter'}
      </h4>

      {!param && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Quick Fill (Thai Industrial Standard)</label>
          <div className="flex flex-wrap gap-1.5">
            {defaultParamDefs.map(d => (
              <button
                key={d.id}
                onClick={() => quickFill(d.id)}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Parameter ID</label>
          <input type="text" value={id} onChange={e => setId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. ph" disabled={!!param}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Display Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. pH"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. mg/L"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Min Value</label>
          <input type="number" step="any" value={min} onChange={e => setMin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Max Value</label>
          <input type="number" step="any" value={max} onChange={e => setMax(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">Warning Thresholds</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-amber-600 mb-1">Warning Low</label>
            <input type="number" step="any" value={warningLow} onChange={e => setWarningLow(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-amber-600 mb-1">Warning High</label>
            <input type="number" step="any" value={warningHigh} onChange={e => setWarningHigh(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-semibold text-rose-700">Critical Thresholds</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-rose-600 mb-1">Critical Low</label>
            <input type="number" step="any" value={criticalLow} onChange={e => setCriticalLow(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-rose-600 mb-1">Critical High</label>
            <input type="number" step="any" value={criticalHigh} onChange={e => setCriticalHigh(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">Legal Standard (Thai Industrial Standard)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-emerald-600 mb-1">Legal Low</label>
            <input type="number" step="any" value={legalLow} onChange={e => setLegalLow(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-emerald-600 mb-1">Legal High</label>
            <input type="number" step="any" value={legalHigh} onChange={e => setLegalHigh(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (!id.trim() || !name.trim()) return;
            onSave({
              id: id.trim(),
              name: name.trim(),
              unit,
              value: param?.value || 0,
              min: parseFloat(min) || 0,
              max: parseFloat(max) || 100,
              warningLow: parseFloat(warningLow) || 0,
              warningHigh: parseFloat(warningHigh) || 100,
              criticalLow: parseFloat(criticalLow) || 0,
              criticalHigh: parseFloat(criticalHigh) || 100,
              trend: 0,
              history: param?.history || [0],
              status: 'normal',
            });
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Parameter
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-slate-500 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

function SecuritySection({ onChangePassword, onLogout }: { onChangePassword: (p: string) => void; onLogout: () => void }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = () => {
    if (currentPwd !== localStorage.getItem('wq_admin_pwd') || currentPwd !== '1975') {
      // If stored password doesn't exist yet, use default 1975
      const stored = localStorage.getItem('wq_admin_pwd') || '1975';
      if (currentPwd !== stored) {
        setMsg({ type: 'error', text: 'Current password is incorrect' });
        return;
      }
    }
    if (newPwd.length < 4) {
      setMsg({ type: 'error', text: 'New password must be at least 4 characters' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    onChangePassword(newPwd);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setMsg({ type: 'success', text: 'Password changed successfully' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-primary-500" />
          <h3 className="text-base font-semibold text-slate-800">Change Password</h3>
        </div>

        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {msg && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium fade-in ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <button
            onClick={handleChange}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Session</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sign out of the admin panel</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 text-sm font-medium rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage({ stations, onUpdateStations, onChangePassword, onLogout }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<'stations' | 'parameters' | 'security'>('stations');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showAddStation, setShowAddStation] = useState(false);
  const [editStation, setEditStation] = useState<Station | null>(null);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  const handleAddStation = (data: Partial<Station>) => {
    const newStation: Station = {
      id: `stn-${Date.now()}`,
      name: data.name || 'New Station',
      location: data.location || '',
      coordinates: data.coordinates || { lat: 0, lng: 0 },
      status: data.status || 'online',
      lastSync: new Date(),
      parameters: defaultParamDefs.map(d => ({
        ...d,
        value: 0,
        warningLow: d.legalLow * 0.9,
        warningHigh: d.legalHigh * 1.1,
        criticalLow: d.legalLow * 0.7,
        criticalHigh: d.legalHigh * 1.3,
        trend: 0,
        history: [0],
        status: 'normal' as const,
      })),
      alerts: [],
      uptime: 100,
    };
    onUpdateStations([...stations, newStation]);
    setShowAddStation(false);
  };

  const handleEditStation = (data: Partial<Station>) => {
    if (!editStation) return;
    onUpdateStations(stations.map(s =>
      s.id === editStation.id ? { ...s, ...data } : s
    ));
    setEditStation(null);
  };

  const handleDeleteStation = (id: string) => {
    if (!confirm('Are you sure you want to delete this station? This action cannot be undone.')) return;
    onUpdateStations(stations.filter(s => s.id !== id));
    if (selectedStationId === id) setSelectedStationId(null);
  };

  const handleUpdateStation = (id: string, updates: Partial<Station>) => {
    onUpdateStations(stations.map(s =>
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Settings</h2>
          <p className="text-sm text-slate-400">Manage stations, parameters, and thresholds</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('stations')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeSection === 'stations' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'
          }`}
        >
          Station Management
        </button>
        <button
          onClick={() => setActiveSection('parameters')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeSection === 'parameters' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'
          }`}
        >
          Parameter Config
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeSection === 'security' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            Security
          </span>
        </button>
      </div>

      {activeSection === 'stations' && (
        <div className="space-y-4">
          {(showAddStation || editStation) && (
            <StationForm
              station={editStation || undefined}
              onSave={editStation ? handleEditStation : handleAddStation}
              onCancel={() => { setShowAddStation(false); setEditStation(null); }}
            />
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Monitoring Stations ({stations.length})</h3>
            {!showAddStation && !editStation && (
              <button
                onClick={() => setShowAddStation(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Station
              </button>
            )}
          </div>

          <div className="space-y-3">
            {stations.map((station, idx) => (
              <div
                key={station.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden fade-in"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    station.status === 'online' ? 'bg-emerald-50' : station.status === 'maintenance' ? 'bg-amber-50' : 'bg-slate-100'
                  }`}>
                    {station.status === 'online' ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">{station.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{station.location}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{station.parameters.length} params</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{station.uptime}% uptime</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditStation(station)}
                      className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStation(station.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'parameters' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Select Station</label>
            <div className="flex flex-wrap gap-2">
              {stations.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStationId(s.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    selectedStationId === s.id
                      ? 'bg-primary-50 text-primary-600 border-primary-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {s.name.split(' - ')[0]}
                </button>
              ))}
            </div>
          </div>

          {selectedStation ? (
            <ParameterEditor
              station={selectedStation}
              onUpdateStation={handleUpdateStation}
            />
          ) : (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
              <Settings className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Select a station to configure parameters</p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'security' && (
        <SecuritySection onChangePassword={onChangePassword} onLogout={onLogout} />
      )}
    </div>
  );
}
