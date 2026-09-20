import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, daysBetween, todayStr } from '@/lib/helpers';
import { MapPin, AlertTriangle, Clock } from 'lucide-react';

export function BotijoesFora() {
  const { tanks, movements, representatives } = useApp();
  const today = todayStr();

  const outsideMovements = movements.filter((m) =>
    ['EM_TRANSPORTE', 'ENTREGUE', 'AGUARDANDO_COLETA', 'RETORNANDO'].includes(m.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Botijões Fora da Empresa</h2>
        <p className="text-sm text-slate-500">Acompanhamento dos botijões que estão fora, com destaque para retornos atrasados.</p>
      </div>

      {outsideMovements.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin size={32} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">Nenhum botijão fora da empresa no momento.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-semibold">IMOB</th>
                <th className="px-4 py-3 font-semibold">Representante</th>
                <th className="px-4 py-3 font-semibold">Saída</th>
                <th className="px-4 py-3 font-semibold">Dias Fora</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
                <th className="px-4 py-3 font-semibold">Previsão de Retorno</th>
                <th className="px-4 py-3 font-semibold">Coleta</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {outsideMovements.map((mv) => {
                const tank = tanks.find((t) => t.id === mv.tankId);
                const rep = representatives.find((r) => r.id === mv.representativeId);
                const days = daysBetween(mv.exitDate, today);
                const isLate = mv.deadline < today;
                return (
                  <tr key={mv.id} className={`border-b border-slate-100 last:border-0 ${isLate ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-800">{tank?.imob}</td>
                    <td className="px-4 py-3 text-slate-600">{rep?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(mv.exitDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${days > 10 ? 'text-red-600' : 'text-slate-600'}`}>{days} dias</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={mv.status} /></td>
                    <td className="px-4 py-3 text-slate-500">
                      {isLate ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                          <AlertTriangle size={12} /> Atrasado ({formatDate(mv.deadline)})
                        </span>
                      ) : (
                        formatDate(mv.deadline)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {mv.collectionRequested ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                          <Clock size={12} /> Solicitada
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Não</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
