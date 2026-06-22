import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Flame, FileCheck, ClipboardList, Plane, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '故障热力', icon: Flame, end: true },
  { to: '/quality', label: '案例质量', icon: FileCheck },
  { to: '/review', label: '复盘清单', icon: ClipboardList },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-30',
          'bg-slate-900/95 backdrop-blur-xl border-r border-slate-800',
          'transition-all duration-300 ease-out',
          sidebarOpen ? 'w-64' : 'w-20 lg:w-20'
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                  航线排故知识库
                </h1>
                <p className="text-xs text-slate-400 whitespace-nowrap">质量看板</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-slate-800/60 group',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50',
              'border border-slate-700/50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                质
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">质控专员</p>
                  <p className="text-xs text-slate-500 truncate">维修质量部</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center px-6 gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>数据实时更新</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
