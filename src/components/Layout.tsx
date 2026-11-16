import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, FlaskConical, Package, MapPin, History,
  FileBarChart, Bell, Settings, Menu, X, ChevronDown, Shield, User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';

export type ViewName =
  | 'inicio' | 'testes' | 'botijoes' | 'fora'
  | 'historico' | 'relatorios' | 'notificacoes' | 'admin';

interface LayoutProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
  children: ReactNode;
}

const navItems: { id: ViewName; label: string; icon: ReactNode; roles?: Role[] }[] = [
  { id: 'inicio', label: 'Início', icon: <LayoutDashboard size={20} /> },
  { id: 'testes', label: 'Testes', icon: <FlaskConical size={20} /> },
  { id: 'botijoes', label: 'Botijões', icon: <Package size={20} /> },
  { id: 'fora', label: 'Botijões Fora', icon: <MapPin size={20} /> },
  { id: 'historico', label: 'Histórico', icon: <History size={20} /> },
  { id: 'relatorios', label: 'Relatórios', icon: <FileBarChart size={20} />, roles: ['ADMINISTRADOR'] },
  { id: 'notificacoes', label: 'Notificações', icon: <Bell size={20} /> },
  { id: 'admin', label: 'Administração', icon: <Settings size={20} />, roles: ['ADMINISTRADOR'] },
];

export function Layout({ currentView, onNavigate, children }: LayoutProps) {
  const { currentUser, users, switchUser, notifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(currentUser.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
              <FlaskConical size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">CryoManager</p>
              <p className="text-[10px] text-slate-400">Gestão de Botijões</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                currentView === item.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'notificacoes' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-[10px] font-bold text-amber-700">PROTÓTIPO</p>
            <p className="text-[10px] text-amber-600">Dados Simulados</p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 lg:text-lg">
                {navItems.find((n) => n.id === currentView)?.label || 'Início'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 sm:flex">
              <Shield size={12} />
              Ambiente de Demonstração
            </span>

            <button
              onClick={() => onNavigate('notificacoes')}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-white">
                  <User size={16} />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-slate-700">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {currentUser.role === 'ADMINISTRADOR' ? 'Administrador' : 'Operacional'}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Trocar perfil (demonstração)
                  </p>
                  {users.filter((u) => u.active).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { switchUser(u.id); setProfileOpen(false); }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        u.id === currentUser.id ? 'bg-slate-100 font-semibold text-slate-800' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.role === 'ADMINISTRADOR' ? 'Administrador' : 'Operacional'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
