import { LayoutDashboard, BarChart3, Bell, Settings, Droplets, Lock } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
            WaterMonitor
          </span>
        )}
      </div>

      <nav className="flex-1 py-3 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {!collapsed && item.id === 'settings' && (
                <Lock className="w-3 h-3 text-slate-300 ml-auto" />
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-3 px-3 py-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
      >
        {collapsed ? '→' : '← Collapse'}
      </button>
    </aside>
  );
}
