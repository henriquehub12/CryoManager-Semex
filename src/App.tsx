import { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Layout, type ViewName } from '@/components/Layout';
import { Dashboard } from '@/views/Dashboard';
import { Testes } from '@/views/Testes';
import { Botijoes } from '@/views/Botijoes';
import { BotijoesFora } from '@/views/BotijoesFora';
import { Historico } from '@/views/Historico';
import { Relatorios } from '@/views/Relatorios';
import { Notificacoes } from '@/views/Notificacoes';
import { Administracao } from '@/views/Administracao';
import { useApp } from '@/context/AppContext';
import { Shield } from 'lucide-react';

function MainContent() {
  const { currentUser } = useApp();
  const [view, setView] = useState<ViewName>('inicio');

  const isAdmin = currentUser.role === 'ADMINISTRADOR';

  const renderView = () => {
    switch (view) {
      case 'inicio': return <Dashboard onNavigate={setView} />;
      case 'testes': return <Testes />;
      case 'botijoes': return <Botijoes />;
      case 'fora': return <BotijoesFora />;
      case 'historico': return <Historico />;
      case 'relatorios': return isAdmin ? <Relatorios /> : <AccessDenied />;
      case 'notificacoes': return <Notificacoes />;
      case 'admin': return isAdmin ? <Administracao /> : <AccessDenied />;
      default: return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <Layout currentView={view} onNavigate={setView}>
      {renderView()}
    </Layout>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Shield size={48} className="text-slate-300" />
      <h2 className="mt-4 text-lg font-bold text-slate-700">Acesso Restrito</h2>
      <p className="mt-1 text-sm text-slate-400">Esta área é disponível apenas para administradores.</p>
      <p className="mt-2 text-xs text-slate-400">Troque para o perfil de Administrador no menu superior para acessar.</p>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
