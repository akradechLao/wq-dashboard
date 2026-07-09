import { LayoutDashboard, BarChart3, Bell, Settings, Droplets, Lock, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNav = (id: string) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
            WQ Monitor
          </span>
        )}
      </div>

      <nav className="flex-1 py-3 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'settings-auth');
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
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
        className="hidden lg:flex mx-2 mb-3 px-3 py-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
      >
        {collapsed ? '→' : '← Collapse'}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
      >
        {mobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 flex-col ${
          collapsed ? 'w-[68px]' : 'w-[220px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300 flex flex-col ${
          mobileOpen ? 'w-[220px] translate-x-0' : 'w-[220px] -translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
