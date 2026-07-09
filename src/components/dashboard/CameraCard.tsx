import { Camera as CameraIcon, Maximize2, Wifi, WifiOff, Clock } from 'lucide-react';
import { useState } from 'react';
import type { Camera } from '../../types';

interface CameraCardProps {
  camera: Camera;
  index: number;
}

export function CameraCard({ camera, index }: CameraCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isOnline = camera.status === 'online';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 fade-in"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="relative bg-slate-900 aspect-video">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isOnline ? (
              <>
                <div className="relative">
                  <CameraIcon className="w-12 h-12 text-slate-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <span className="text-xs text-slate-500 mt-2">Live Feed</span>
                <span className="text-[10px] text-slate-600 mt-0.5">{camera.name}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-10 h-10 text-slate-600" />
                <span className="text-xs text-slate-500 mt-2">Offline</span>
              </>
            )}
          </div>

          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <div className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
              isOnline ? 'bg-emerald-500/80 text-white' : 'bg-slate-600/80 text-slate-300'
            }`}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-white" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex items-center gap-1 text-[10px] text-white/80">
              <Clock className="w-2.5 h-2.5" />
              {formatTime(camera.lastSync)}
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{camera.stationName}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{camera.location}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {isOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {camera.status}
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative bg-slate-900 aspect-video">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isOnline ? (
                  <>
                    <CameraIcon className="w-20 h-20 text-slate-600" />
                    <span className="text-sm text-slate-500 mt-3">Live Feed - {camera.name}</span>
                    <span className="text-xs text-slate-600 mt-1">{camera.location}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-16 h-16 text-slate-600" />
                    <span className="text-sm text-slate-500 mt-3">Camera Offline</span>
                  </>
                )}
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  isOnline ? 'bg-emerald-500/80 text-white' : 'bg-slate-600/80 text-slate-300'
                }`}>
                  {isOnline ? 'LIVE' : 'OFFLINE'}
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors text-white text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Clock className="w-3 h-3" />
                  {formatTime(camera.lastSync)}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{camera.name} - {camera.stationName}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{camera.location}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {camera.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
