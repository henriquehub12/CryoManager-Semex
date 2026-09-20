import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea, Field } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatDateTime, daysBetween, todayStr } from '@/lib/helpers';
import {
  Plus, Search, Package, ChevronRight, FlaskConical, Truck,
  History as HistoryIcon, QrCode, X,
} from 'lucide-react';
import type { TankModel } from '@/types';

export function Botijoes() {
  const { tanks, models, tests, movements, users, representatives, addTank } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState<TankModel | null>(null);

  // Add form
  const [imob, setImob] = useState('');
  const [serial, setSerial] = useState('');
  const [modelId, setModelId] = useState('');
  const [obs, setObs] = useState('');
  const [addError, setAddError] = useState('');

  const getModelName = (id: string) => models.find((m) => m.id === id)?.name || '—';
  const getEmployeeName = (id: string) => users.find((u) => u.id === id)?.name || '—';

  const filtered = tanks.filter((t) => {
    const matchSearch = t.imob.toLowerCase().includes(search.toLowerCase()) || t.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!imob || !serial || !modelId) { setAddError('Preencha IMOB, série e modelo'); return; }
    const result = addTank({ imob, serialNumber: serial, modelId, observations: obs });
    if (!result.ok) { setAddError(result.error || 'Erro'); return; }
    setShowAddModal(false); setImob(''); setSerial(''); setModelId(''); setObs(''); setAddError('');
  };

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'APTO', label: 'Apto' },
    { value: 'NAO_APTO', label: 'Não Apto' },
    { value: 'EM_TESTE', label: 'Em Teste' },
    { value: 'AGUARDANDO_TESTE', label: 'Aguardando Teste' },
    { value: 'EM_TRANSPORTE', label: 'Em Transporte' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'AGUARDANDO_COLETA', label: 'Aguardando Coleta' },
    { value: 'RETORNADO', label: 'Retornado' },
    { value: 'AGUARDANDO_NOVO_TESTE', label: 'Aguardando Novo Teste' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Botijões Criogênicos</h2>
          <p className="text-sm text-slate-500">{tanks.length} botijões cadastrados</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus size={20} /> Cadastrar Botijão
        </Button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Buscar por IMOB ou número de série..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-56">
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-semibold">IMOB</th>
              <th className="px-4 py-3 font-semibold">Série</th>
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Cadastro</th>
              <th className="px-4 py-3 font-semibold">Testes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const testCount = tests.filter((test) => test.tankId === t.id).length;
              return (
                <tr key={t.id} onClick={() => setSelectedTank(t)} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{t.imob}</td>
                  <td className="px-4 py-3 text-slate-600">{t.serialNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{getModelName(t.modelId)}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-500">{testCount}</td>
                  <td className="px-4 py-3"><ChevronRight size={16} className="text-slate-400" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <Package size={32} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">Nenhum botijão encontrado.</p>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Cadastrar Botijão">
        <div className="space-y-4">
          <Field label="IMOB (identificação interna)">
            <Input placeholder="Ex: 465" value={imob} onChange={(e) => setImob(e.target.value)} />
          </Field>
          <Field label="Número de Série (identificação do fabricante)">
            <Input placeholder="Ex: DEMO2026016" value={serial} onChange={(e) => setSerial(e.target.value)} />
          </Field>
          <Field label="Modelo">
            <Select value={modelId} onChange={(e) => setModelId(e.target.value)}>
              <option value="">Selecione...</option>
              {models.filter((m) => m.active).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </Field>
          <Field label="Observações">
            <Textarea rows={2} placeholder="Observações opcionais..." value={obs} onChange={(e) => setObs(e.target.value)} />
          </Field>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Cadastrar</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selectedTank} onClose={() => setSelectedTank(null)} title={`Ficha do Botijão — IMOB ${selectedTank?.imob}`} size="xl">
        {selectedTank && (() => {
          const tankTests = tests.filter((t) => t.tankId === selectedTank.id);
          const tankMovements = movements.filter((m) => m.tankId === selectedTank.id);
          const lastTest = tankTests[0];
          const lastMovement = tankMovements[0];
          return (
            <div className="space-y-5">
              {/* QR placeholder */}
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <QrCode size={32} className="text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-600">QR Code (futuro)</p>
                  <p className="text-xs text-slate-400">No sistema oficial, o QR Code permitirá acessar a ficha do botijão rapidamente.</p>
                </div>
              </div>

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">IMOB</p>
                  <p className="text-lg font-bold text-slate-700">{selectedTank.imob}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Série</p>
                  <p className="text-sm font-bold text-slate-700">{selectedTank.serialNumber}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Modelo</p>
                  <p className="text-sm font-bold text-slate-700">{getModelName(selectedTank.modelId)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedTank.status} /></div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Cadastro</p>
                  <p className="text-sm font-bold text-slate-700">{formatDate(selectedTank.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Testes realizados</p>
                  <p className="text-sm font-bold text-slate-700">{tankTests.length}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Último teste</p>
                  <p className="text-sm font-bold text-slate-700">{lastTest ? formatDate(lastTest.startDate) : '—'}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Última movimentação</p>
                  <p className="text-sm font-bold text-slate-700">{lastMovement ? formatDate(lastMovement.exitDate) : '—'}</p>
                </div>
              </div>

              {selectedTank.observations && (
                <div><p className="text-xs text-slate-400">Observações</p><p className="text-sm text-slate-600">{selectedTank.observations}</p></div>
              )}

              {/* Test history */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FlaskConical size={16} /> Histórico de Testes
                </h3>
                <div className="space-y-2">
                  {tankTests.map((test) => (
                    <div key={test.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-2 w-2 rounded-full ${test.result === 'APTO' ? 'bg-emerald-500' : test.result === 'NAO_APTO' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <p className="text-sm font-semibold text-slate-700">{formatDateTime(test.startDate, test.startTime)}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          test.result === 'APTO' ? 'bg-emerald-100 text-emerald-700' :
                          test.result === 'NAO_APTO' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {test.result === 'APTO' ? 'Apto' : test.result === 'NAO_APTO' ? 'Não Apto' : 'Pendente'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                        <div><span className="text-slate-400">Inicial:</span> <span className="font-semibold text-slate-600">{test.initialLevel} cm</span></div>
                        <div><span className="text-slate-400">24h:</span> <span className="font-semibold text-slate-600">{test.m24h ? `${test.m24h.level} cm` : '—'}</span></div>
                        <div><span className="text-slate-400">48h:</span> <span className="font-semibold text-slate-600">{test.m48h ? `${test.m48h.level} cm` : '—'}</span></div>
                        <div><span className="text-slate-400">Por:</span> <span className="font-semibold text-slate-600">{getEmployeeName(test.employeeId)}</span></div>
                      </div>
                      {test.observations && <p className="mt-1 text-xs text-slate-500">{test.observations}</p>}
                    </div>
                  ))}
                  {tankTests.length === 0 && <p className="text-sm text-slate-400">Nenhum teste realizado.</p>}
                </div>
              </div>

              {/* Movement history */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Truck size={16} /> Histórico de Movimentações
                </h3>
                <div className="space-y-2">
                  {tankMovements.map((mv) => {
                    const rep = representatives.find((r) => r.id === mv.representativeId);
                    return (
                      <div key={mv.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700">Saída: {formatDate(mv.exitDate)}</p>
                          <StatusBadge status={mv.status} />
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {rep?.name} · {mv.regional}/{mv.uf} · NF: {mv.invoice}
                        </div>
                        {mv.deliveryDate && <div className="text-xs text-slate-500">Entrega: {formatDate(mv.deliveryDate)}</div>}
                        {mv.returnDate && <div className="text-xs text-slate-500">Retorno: {formatDate(mv.returnDate)}</div>}
                      </div>
                    );
                  })}
                  {tankMovements.length === 0 && <p className="text-sm text-slate-400">Nenhuma movimentação registrada.</p>}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
