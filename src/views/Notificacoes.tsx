import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/helpers';
import {
  Bell, Clock, AlertTriangle, XCircle, Package, MapPin,
  CheckCheck,
} from 'lucide-react';
import type { Notification } from '@/types';

const typeConfig: Record<Notification['type'], { icon: typeof Bell; color: string; label: string }> = {
  M24H: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Medição 24h' },
  M48H: { icon: Clock, color: 'bg-cyan-100 text-cyan-700', label: 'Medição 48h' },
  TESTE_ATRASADO: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'Teste Atrasado' },
  NAO_APTO: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Não Apto' },
  AGUARDANDO_COLETA: { icon: Package, color: 'bg-orange-100 text-orange-700', label: 'Aguardando Coleta' },
  RETORNO_ATRASADO: { icon: MapPin, color: 'bg-red-100 text-red-700', label: 'Retorno Atrasado' },
};

export function Notificacoes() {
  const { notifications, markNotificationRead, markAllNotificationsRead, tanks } = useApp();
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const renderNotification = (n: Notification) => {
    const cfg = typeConfig[n.type];
    const Icon = cfg.icon;
    const tank = tanks.find((t) => t.id === n.tankId);
    return (
      <Card key={n.id} className={`p-4 ${n.read ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{cfg.label}</span>
              <span className="text-xs text-slate-400">{formatDate(n.date)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-700">{n.message}</p>
            {tank && <p className="mt-1 text-xs text-slate-400">IMOB {tank.imob} · {tank.serialNumber}</p>}
          </div>
          {!n.read && (
            <button
              onClick={() => markNotificationRead(n.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <CheckCheck size={16} />
            </button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Central de Notificações</h2>
          <p className="text-sm text-slate-500">{unread.length} não lidas de {notifications.length} total</p>
        </div>
        {unread.length > 0 && (
          <Button variant="secondary" onClick={markAllNotificationsRead}>
            <CheckCheck size={16} /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Novas</h3>
          <div className="space-y-3">
            {unread.map(renderNotification)}
          </div>
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Lidas</h3>
          <div className="space-y-3">
            {read.map(renderNotification)}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <Card className="p-8 text-center">
          <Bell size={32} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">Nenhuma notificação.</p>
        </Card>
      )}
    </div>
  );
}
