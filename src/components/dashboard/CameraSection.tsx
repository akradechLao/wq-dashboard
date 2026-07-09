import { Camera as CameraIcon } from 'lucide-react';
import type { Camera } from '../../types';
import { CameraCard } from './CameraCard';

interface CameraSectionProps {
  cameras: Camera[];
}

export function CameraSection({ cameras }: CameraSectionProps) {
  const onlineCount = cameras.filter(c => c.status === 'online').length;

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <CameraIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">CCTV Monitoring</h3>
            <p className="text-xs text-slate-400">Factory effluent discharge points</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">{onlineCount} Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((camera, idx) => (
          <CameraCard key={camera.id} camera={camera} index={idx} />
        ))}
      </div>
    </div>
  );
}
