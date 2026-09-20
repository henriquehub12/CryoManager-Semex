import { useApp } from '@/context/AppContext';
import { Card, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatDateTime, daysBetween, todayStr } from '@/lib/helpers';
import type { ViewName } from '@/components/Layout';
import {
  CheckCircle2, XCircle, FlaskConical, Clock, Truck, Package,
  MapPin, AlertTriangle, ClipboardCheck, Bell,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewName) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { tanks, tests, movements, notifications, currentUser, responsibles } = useApp();

  const apto = tanks.filter((t) => t.status === 'APTO').length;
  const naoApto = tanks.filter((t) => t.status === 'NAO_APTO').length;
  const emTeste = tanks.filter((t) => t.status === 'EM_TESTE').length;
  const aguardandoTeste = tanks.filter((t) => t.status === 'AGUARDANDO_TESTE' || t.status === 'AGUARDANDO_NOVO_TESTE').length;
  const fora = tanks.filter((t) =>
    ['EM_TRANSPORTE', 'ENTREGUE', 'AGUARDANDO_COLETA', 'RETORNANDO'].includes(t.status)
  ).length;

  const today = todayStr();
  const m24hToday = tests.filter((t) => t.stage !== 'CONCLUIDO' && t.expected24h.slice(0, 10) === today);
  const m48hToday = tests.filter((t) => t.stage !== 'CONCLUIDO' && t.expected48h.slice(0, 10) === today);
  const atrasados = tests.filter((t) => {
    if (t.stage === 'CONCLUIDO') return false;
    if (!t.m24h && t.expected24h.slice(0, 10) < today) return true;
    if (t.m24h && !t.m48h && t.expected48h.slice(0, 10) < today) return true;
    return false;
  });
  const concluidosRecentes = tests.filter((t) => t.stage === 'CONCLUIDO').slice(0, 5);

  const emTransporte = movements.filter((m) => m.status === 'EM_TRANSPORTE').length;
  const entregues = movements.filter((m) => m.status === 'ENTREGUE').length;
  const aguardandoColeta = movements.filter((m) => m.status === 'AGUARDANDO_COLETA').length;
  const retornando = movements.filter((m) => m.status === 'RETORNANDO').length;
  const retornosAtrasados = movements.filter((m) => {
    if (m.returnDate) return false;
    if (['RETORNADO', 'AGUARDANDO_NOVO_TESTE'].includes(m.status)) return false;
    return m.deadline < today;
  });

  const mainResp = responsibles.find((r) => r.isMain);
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo, {currentUser.name}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {currentUser.role === 'ADMINISTRADOR'
                ? 'Você tem acesso completo ao sistema.'
                : 'Você tem acesso às operações de testes e logística.'}
            </p>
          </div>
          {mainResp && (
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
              <ClipboardCheck size={16} className="text-slate-300" />
              <span className="text-slate-300">Responsável do setor:</span>
              <span className="font-semibold text-white">{mainResp.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{mainResp.role}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Botijões section */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Botijões</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Aptos" value={apto} icon={<CheckCircle2 size={24} className="text-white" />} color="bg-emerald-500" onClick={() => onNavigate('botijoes')} />
          <StatCard label="Não Aptos" value={naoApto} icon={<XCircle size={24} className="text-white" />} color="bg-red-500" onClick={() => onNavigate('botijoes')} />
          <StatCard label="Em Teste" value={emTeste} icon={<FlaskConical size={24} className="text-white" />} color="bg-amber-500" onClick={() => onNavigate('testes')} />
          <StatCard label="Aguardando Teste" value={aguardandoTeste} icon={<Clock size={24} className="text-white" />} color="bg-slate-400" onClick={() => onNavigate('botijoes')} />
          <StatCard label="Fora da Empresa" value={fora} icon={<MapPin size={24} className="text-white" />} color="bg-indigo-500" onClick={() => onNavigate('fora')} />
        </div>
      </div>

      {/* Testes section */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Testes</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Medição 24h Hoje" value={m24hToday.length} icon={<Clock size={24} className="text-white" />} color="bg-blue-500" onClick={() => onNavigate('testes')} />
          <StatCard label="Medição 48h Hoje" value={m48hToday.length} icon={<Clock size={24} className="text-white" />} color="bg-cyan-500" onClick={() => onNavigate('testes')} />
          <StatCard label="Testes Atrasados" value={atrasados.length} icon={<AlertTriangle size={24} className="text-white" />} color="bg-red-500" onClick={() => onNavigate('testes')} />
          <StatCard label="Concluídos Recentemente" value={concluidosRecentes.length} icon={<CheckCircle2 size={24} className="text-white" />} color="bg-emerald-500" onClick={() => onNavigate('testes')} />
        </div>
      </div>

      {/* Logística section */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Logística</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Em Transporte" value={emTransporte} icon={<Truck size={24} className="text-white" />} color="bg-indigo-500" onClick={() => onNavigate('logistica')} />
          <StatCard label="Entregues" value={entregues} icon={<Package size={24} className="text-white" />} color="bg-teal-500" onClick={() => onNavigate('logistica')} />
          <StatCard label="Aguardando Coleta" value={aguardandoColeta} icon={<Clock size={24} className="text-white" />} color="bg-orange-500" onClick={() => onNavigate('logistica')} />
          <StatCard label="Retornando" value={retornando} icon={<MapPin size={24} className="text-white" />} color="bg-violet-500" onClick={() => onNavigate('logistica')} />
          <StatCard label="Retornos Atrasados" value={retornosAtrasados.length} icon={<AlertTriangle size={24} className="text-white" />} color="bg-red-500" onClick={() => onNavigate('fora')} />
        </div>
      </div>

      {/* Two-column: Upcoming + Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medições previstas */}
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-700">Medições Previstas para Hoje</h3>
          <div className="space-y-3">
            {[...m24hToday.map((t) => ({ test: t, type: '24h' })), ...m48hToday.map((t) => ({ test: t, type: '48h' }))].map(({ test, type }) => {
              const tank = tanks.find((t) => t.id === test.tankId);
              return (
                <div key={`${test.id}-${type}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">IMOB {tank?.imob}</p>
                    <p className="text-xs text-slate-400">{tank?.serialNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${type === '24h' ? 'bg-blue-100 text-blue-700' : 'bg-cyan-100 text-cyan-700'}`}>
                      Medição {type}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      Previsto: {type === '24h' ? test.expected24h.slice(11) : test.expected48h.slice(11)}
                    </p>
                  </div>
                </div>
              );
            })}
            {m24hToday.length === 0 && m48hToday.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">Nenhuma medição prevista para hoje.</p>
            )}
          </div>
        </Card>

        {/* Notificações recentes */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Notificações Recentes</h3>
            <button onClick={() => onNavigate('notificacoes')} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
              Ver todas
            </button>
          </div>
          <div className="space-y-2">
            {unread.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                <Bell size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-sm text-slate-700">{n.message}</p>
              </div>
            ))}
            {unread.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">Sem novas notificações.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Testes concluídos recentes */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-700">Testes Concluídos Recentemente</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="pb-2 font-medium">IMOB</th>
                <th className="pb-2 font-medium">Série</th>
                <th className="pb-2 font-medium">Início</th>
                <th className="pb-2 font-medium">Nível Inicial</th>
                <th className="pb-2 font-medium">24h</th>
                <th className="pb-2 font-medium">48h</th>
                <th className="pb-2 font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {concluidosRecentes.map((t) => {
                const tank = tanks.find((tk) => tk.id === t.tankId);
                return (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 font-semibold text-slate-700">{tank?.imob}</td>
                    <td className="py-2.5 text-slate-500">{tank?.serialNumber}</td>
                    <td className="py-2.5 text-slate-500">{formatDateTime(t.startDate, t.startTime)}</td>
                    <td className="py-2.5 text-slate-500">{t.initialLevel} cm</td>
                    <td className="py-2.5 text-slate-500">{t.m24h ? `${t.m24h.level} cm` : '—'}</td>
                    <td className="py-2.5 text-slate-500">{t.m48h ? `${t.m48h.level} cm` : '—'}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        t.result === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.result === 'APTO' ? 'Apto' : 'Não Apto'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
