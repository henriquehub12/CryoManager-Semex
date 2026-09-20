import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Form';
import { formatDate, formatDateTime } from '@/lib/helpers';
import { History as HistoryIcon, FlaskConical, Truck, Search } from 'lucide-react';
import type { TankModel } from '@/types';

export function Historico() {
  const { tanks, tests, movements, users, representatives, models } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTank, setSelectedTank] = useState<TankModel | null>(null);

  const filtered = tanks.filter((t) =>
    t.imob.toLowerCase().includes(search.toLowerCase()) ||
    t.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getModelName = (id: string) => models.find((m) => m.id === id)?.name || '—';
  const getEmployeeName = (id: string) => users.find((u) => u.id === id)?.name || '—';

  // Build timeline for selected tank
  type TimelineEntry = { date: string; time: string; title: string; subtitle: string; icon: 'test' | 'movement' };
  const timeline: TimelineEntry[] = [];

  if (selectedTank) {
    tests.filter((t) => t.tankId === selectedTank.id).forEach((test) => {
      timeline.push({
        date: test.startDate, time: test.startTime,
        title: `Teste iniciado — Nível: ${test.initialLevel} cm`,
        subtitle: `Por: ${getEmployeeName(test.employeeId)}`,
        icon: 'test',
      });
      if (test.m24h) {
        timeline.push({
          date: test.m24h.date, time: test.m24h.time,
          title: `Medição 24h — ${test.m24h.level} cm`,
          subtitle: `Por: ${getEmployeeName(test.m24h.employeeId)}`,
          icon: 'test',
        });
      }
      if (test.m48h) {
        timeline.push({
          date: test.m48h.date, time: test.m48h.time,
          title: `Medição 48h — ${test.m48h.level} cm`,
          subtitle: `Por: ${getEmployeeName(test.m48h.employeeId)}`,
          icon: 'test',
        });
      }
      if (test.stage === 'CONCLUIDO') {
        timeline.push({
          date: test.concludedAt?.slice(0, 10) || test.startDate, time: '',
          title: `Resultado: ${test.result === 'APTO' ? 'APTO' : 'NÃO APTO'}`,
          subtitle: test.observations || '',
          icon: 'test',
        });
      }
    });
    movements.filter((m) => m.tankId === selectedTank.id).forEach((mv) => {
      const rep = representatives.find((r) => r.id === mv.representativeId);
      timeline.push({
        date: mv.exitDate, time: '',
        title: `Saída — ${rep?.name || ''}`,
        subtitle: `NF: ${mv.invoice} · ${mv.doseCount} doses`,
        icon: 'movement',
      });
      if (mv.deliveryDate) {
        timeline.push({ date: mv.deliveryDate, time: '', title: 'Entregue', subtitle: `${rep?.name || ''}`, icon: 'movement' });
      }
      if (mv.collectionRequested) {
        timeline.push({ date: mv.collectionDate || mv.deliveryDate || mv.exitDate, time: '', title: 'Coleta solicitada', subtitle: '', icon: 'movement' });
      }
      if (mv.returnDate) {
        timeline.push({ date: mv.returnDate, time: '', title: 'Retornou', subtitle: mv.returnCondition, icon: 'movement' });
      }
    });
    timeline.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Histórico Completo</h2>
        <p className="text-sm text-slate-500">Linha do tempo de testes e movimentações por botijão.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tank list */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar IMOB ou série..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTank(t)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                  selectedTank?.id === t.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-700">IMOB {t.imob}</p>
                  <p className="text-xs text-slate-400">{t.serialNumber}</p>
                </div>
                <HistoryIcon size={16} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          {selectedTank ? (
            <Card className="p-5">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">IMOB {selectedTank.imob}</h3>
                <p className="text-sm text-slate-400">{selectedTank.serialNumber} · {getModelName(selectedTank.modelId)}</p>
              </div>

              <div className="relative space-y-4 pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />
                {timeline.map((entry, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-5 flex h-4 w-4 items-center justify-center rounded-full ${
                      entry.icon === 'test' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}>
                      {entry.icon === 'test' ? <FlaskConical size={8} className="text-white" /> : <Truck size={8} className="text-white" />}
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-slate-400">{formatDateTime(entry.date, entry.time)}</p>
                      <p className="text-sm font-semibold text-slate-700">{entry.title}</p>
                      {entry.subtitle && <p className="text-xs text-slate-500">{entry.subtitle}</p>}
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-sm text-slate-400">Sem registros no histórico.</p>
                )}
              </div>
            </Card>
          ) : (
            <Card className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <HistoryIcon size={32} className="mx-auto text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">Selecione um botijão para ver o histórico completo.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
