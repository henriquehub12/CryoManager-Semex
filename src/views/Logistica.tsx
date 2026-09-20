import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea, Field } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, todayStr } from '@/lib/helpers';
import {
  Plus, Truck, Package, MapPin, Clock, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import type { Movement } from '@/types';

type Tab = 'todas' | 'preparacao' | 'transporte' | 'entregue' | 'coleta' | 'retornando' | 'retornado';

export function Logistica() {
  const { tanks, movements, representatives, carriers, users, createMovement, updateMovement, registerReturn } = useApp();
  const [tab, setTab] = useState<Tab>('todas');
  const [showExitModal, setShowExitModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);

  // Exit form
  const [exitTank, setExitTank] = useState('');
  const [exitRep, setExitRep] = useState('');
  const [exitCarrier, setExitCarrier] = useState('');
  const [exitInvoice, setExitInvoice] = useState('');
  const [exitOrder, setExitOrder] = useState('');
  const [exitOrderCount, setExitOrderCount] = useState('');
  const [exitDoses, setExitDoses] = useState('');
  const [exitDeadline, setExitDeadline] = useState('');
  const [exitForecast, setExitForecast] = useState('');
  const [exitObs, setExitObs] = useState('');

  // Return form
  const [returnReceiver, setReturnReceiver] = useState('');
  const [returnCondition, setReturnCondition] = useState('');
  const [returnObs, setReturnObs] = useState('');

  const aptoTanks = tanks.filter((t) => t.status === 'APTO' || t.status === 'SEPARADO');
  const today = todayStr();

  const filtered = movements.filter((m) => {
    switch (tab) {
      case 'preparacao': return m.status === 'EM_PREPARACAO';
      case 'transporte': return m.status === 'EM_TRANSPORTE';
      case 'entregue': return m.status === 'ENTREGUE';
      case 'coleta': return m.status === 'AGUARDANDO_COLETA';
      case 'retornando': return m.status === 'RETORNANDO';
      case 'retornado': return m.status === 'RETORNADO' || m.status === 'AGUARDANDO_NOVO_TESTE';
      default: return true;
    }
  });

  const handleCreateExit = () => {
    if (!exitTank || !exitRep || !exitCarrier) return;
    const tank = tanks.find((t) => t.id === exitTank);
    const rep = representatives.find((r) => r.id === exitRep);
    if (!tank || !rep) return;
    createMovement({
      tankId: exitTank,
      representativeId: exitRep,
      regional: rep.regional,
      uf: rep.uf,
      carrierId: exitCarrier,
      exitDate: today,
      invoice: exitInvoice,
      orderNumber: exitOrder,
      orderCount: parseInt(exitOrderCount) || 0,
      doseCount: parseInt(exitDoses) || 0,
      deadline: exitDeadline,
      deliveryForecast: exitForecast,
      deliveryDate: null,
      collectionRequested: false,
      collectionDate: null,
      returnDate: null,
      receivedBy: null,
      returnCondition: '',
      observations: exitObs,
    });
    setShowExitModal(false);
    setExitTank(''); setExitRep(''); setExitCarrier(''); setExitInvoice(''); setExitOrder('');
    setExitOrderCount(''); setExitDoses(''); setExitDeadline(''); setExitForecast(''); setExitObs('');
  };

  const handleReturn = () => {
    if (!showReturnModal || !returnReceiver) return;
    registerReturn(showReturnModal, returnReceiver, returnCondition, returnObs);
    setShowReturnModal(null);
    setReturnReceiver(''); setReturnCondition(''); setReturnObs('');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'preparacao', label: 'Em Preparação' },
    { id: 'transporte', label: 'Em Transporte' },
    { id: 'entregue', label: 'Entregue' },
    { id: 'coleta', label: 'Aguardando Coleta' },
    { id: 'retornando', label: 'Retornando' },
    { id: 'retornado', label: 'Retornado' },
  ];

  const detailMovement = showDetailModal ? movements.find((m) => m.id === showDetailModal) : null;
  const detailTank = detailMovement ? tanks.find((t) => t.id === detailMovement.tankId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Movimentação e Logística</h2>
          <p className="text-sm text-slate-500">Controle de saída, transporte, entrega, coleta e retorno dos botijões.</p>
        </div>
        <Button onClick={() => setShowExitModal(true)} size="lg" disabled={aptoTanks.length === 0}>
          <Plus size={20} /> Registrar Saída
        </Button>
      </div>

      {aptoTanks.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Nenhum botijão APTO disponível para envio no momento.
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              tab === t.id ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Movement cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((mv) => {
          const tank = tanks.find((t) => t.id === mv.tankId);
          const rep = representatives.find((r) => r.id === mv.representativeId);
          const carrier = carriers.find((c) => c.id === mv.carrierId);
          const daysOut = mv.returnDate ? 0 : Math.max(0, Math.floor((new Date(today).getTime() - new Date(mv.exitDate).getTime()) / (1000 * 60 * 60 * 24)));
          const isLate = !mv.returnDate && mv.deadline < today && !['RETORNADO', 'AGUARDANDO_NOVO_TESTE'].includes(mv.status);

          return (
            <Card key={mv.id} className="p-4" onClick={() => setShowDetailModal(mv.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Truck size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">IMOB {tank?.imob}</p>
                    <p className="text-xs text-slate-400">{tank?.serialNumber}</p>
                  </div>
                </div>
                <StatusBadge status={mv.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-xs text-slate-400">Representante</p><p className="font-medium text-slate-600">{rep?.name}</p></div>
                <div><p className="text-xs text-slate-400">Transportadora</p><p className="font-medium text-slate-600">{carrier?.name}</p></div>
                <div><p className="text-xs text-slate-400">Saída</p><p className="font-medium text-slate-600">{formatDate(mv.exitDate)}</p></div>
                <div><p className="text-xs text-slate-400">UF</p><p className="font-medium text-slate-600">{mv.uf}</p></div>
                <div><p className="text-xs text-slate-400">Doses</p><p className="font-medium text-slate-600">{mv.doseCount}</p></div>
                <div><p className="text-xs text-slate-400">NF</p><p className="font-medium text-slate-600">{mv.invoice}</p></div>
              </div>

              {isLate && (
                <div className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                  Retorno atrasado — {daysOut} dias fora
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {mv.status === 'EM_PREPARACAO' && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); updateMovement(mv.id, { status: 'EM_TRANSPORTE' }); }}>
                    <Truck size={14} /> Em Transporte
                  </Button>
                )}
                {mv.status === 'EM_TRANSPORTE' && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); updateMovement(mv.id, { status: 'ENTREGUE', deliveryDate: today }); }}>
                    <Package size={14} /> Confirmar Entrega
                  </Button>
                )}
                {mv.status === 'ENTREGUE' && (
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); updateMovement(mv.id, { status: 'AGUARDANDO_COLETA', collectionRequested: true, collectionDate: today }); }}>
                    <Clock size={14} /> Solicitar Coleta
                  </Button>
                )}
                {mv.status === 'AGUARDANDO_COLETA' && (
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); updateMovement(mv.id, { status: 'RETORNANDO' }); }}>
                    <ArrowLeft size={14} /> Iniciar Retorno
                  </Button>
                )}
                {mv.status === 'RETORNANDO' && (
                  <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); setShowReturnModal(mv.id); }}>
                    <CheckCircle2 size={14} /> Registrar Retorno
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="col-span-full p-8 text-center">
            <Truck size={32} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">Nenhuma movimentação encontrada.</p>
          </Card>
        )}
      </div>

      {/* Exit Modal */}
      <Modal open={showExitModal} onClose={() => setShowExitModal(false)} title="Registrar Saída de Botijão" size="lg">
        <div className="space-y-4">
          <Field label="Botijão (somente APTO ou SEPARADO)">
            <Select value={exitTank} onChange={(e) => setExitTank(e.target.value)}>
              <option value="">Selecione...</option>
              {aptoTanks.map((t) => <option key={t.id} value={t.id}>IMOB {t.imob} — {t.serialNumber}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Representante">
              <Select value={exitRep} onChange={(e) => setExitRep(e.target.value)}>
                <option value="">Selecione...</option>
                {representatives.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </Field>
            <Field label="Transportadora">
              <Select value={exitCarrier} onChange={(e) => setExitCarrier(e.target.value)}>
                <option value="">Selecione...</option>
                {carriers.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Nota Fiscal">
              <Input placeholder="Ex: NF-001300" value={exitInvoice} onChange={(e) => setExitInvoice(e.target.value)} />
            </Field>
            <Field label="Pedido">
              <Input placeholder="Ex: PED-7850" value={exitOrder} onChange={(e) => setExitOrder(e.target.value)} />
            </Field>
            <Field label="Qtd. Pedidos">
              <Input type="number" placeholder="Ex: 3" value={exitOrderCount} onChange={(e) => setExitOrderCount(e.target.value)} />
            </Field>
            <Field label="Qtd. Doses">
              <Input type="number" placeholder="Ex: 450" value={exitDoses} onChange={(e) => setExitDoses(e.target.value)} />
            </Field>
            <Field label="Prazo (data)">
              <Input type="date" value={exitDeadline} onChange={(e) => setExitDeadline(e.target.value)} />
            </Field>
            <Field label="Previsão de Entrega">
              <Input type="date" value={exitForecast} onChange={(e) => setExitForecast(e.target.value)} />
            </Field>
          </div>
          <Field label="Observações">
            <Textarea rows={2} placeholder="Observações opcionais..." value={exitObs} onChange={(e) => setExitObs(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowExitModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateExit}>Registrar Saída</Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal open={!!showReturnModal} onClose={() => setShowReturnModal(null)} title="Registrar Retorno do Botijão">
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700">
              Ao registrar o retorno, o botijão será automaticamente atualizado para "Aguardando Novo Teste".
            </p>
          </div>
          <Field label="Funcionário que recebeu">
            <Select value={returnReceiver} onChange={(e) => setReturnReceiver(e.target.value)}>
              <option value="">Selecione...</option>
              {users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </Field>
          <Field label="Estado/Situação do botijão">
            <Input placeholder="Ex: Bom estado, sem avarias" value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} />
          </Field>
          <Field label="Observações">
            <Textarea rows={2} placeholder="Observações opcionais..." value={returnObs} onChange={(e) => setReturnObs(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowReturnModal(null)}>Cancelar</Button>
            <Button variant="success" onClick={handleReturn}>Confirmar Retorno</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!showDetailModal} onClose={() => setShowDetailModal(null)} title="Detalhes da Movimentação" size="lg">
        {detailMovement && detailTank && (() => {
          const rep = representatives.find((r) => r.id === detailMovement.representativeId);
          const carrier = carriers.find((c) => c.id === detailMovement.carrierId);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">IMOB</p><p className="font-semibold text-slate-700">{detailTank.imob}</p></div>
                <div><p className="text-xs text-slate-400">Série</p><p className="font-semibold text-slate-700">{detailTank.serialNumber}</p></div>
                <div><p className="text-xs text-slate-400">Representante</p><p className="font-semibold text-slate-700">{rep?.name}</p></div>
                <div><p className="text-xs text-slate-400">Regional/UF</p><p className="font-semibold text-slate-700">{detailMovement.regional}/{detailMovement.uf}</p></div>
                <div><p className="text-xs text-slate-400">Transportadora</p><p className="font-semibold text-slate-700">{carrier?.name}</p></div>
                <div><p className="text-xs text-slate-400">Nota Fiscal</p><p className="font-semibold text-slate-700">{detailMovement.invoice}</p></div>
                <div><p className="text-xs text-slate-400">Pedido</p><p className="font-semibold text-slate-700">{detailMovement.orderNumber}</p></div>
                <div><p className="text-xs text-slate-400">Qtd. Pedidos</p><p className="font-semibold text-slate-700">{detailMovement.orderCount}</p></div>
                <div><p className="text-xs text-slate-400">Qtd. Doses</p><p className="font-semibold text-slate-700">{detailMovement.doseCount}</p></div>
                <div><p className="text-xs text-slate-400">Saída</p><p className="font-semibold text-slate-700">{formatDate(detailMovement.exitDate)}</p></div>
                <div><p className="text-xs text-slate-400">Prazo</p><p className="font-semibold text-slate-700">{formatDate(detailMovement.deadline)}</p></div>
                <div><p className="text-xs text-slate-400">Previsão de Entrega</p><p className="font-semibold text-slate-700">{formatDate(detailMovement.deliveryForecast)}</p></div>
                <div><p className="text-xs text-slate-400">Entrega</p><p className="font-semibold text-slate-700">{detailMovement.deliveryDate ? formatDate(detailMovement.deliveryDate) : '—'}</p></div>
                <div><p className="text-xs text-slate-400">Coleta Solicitada</p><p className="font-semibold text-slate-700">{detailMovement.collectionRequested ? `Sim (${detailMovement.collectionDate ? formatDate(detailMovement.collectionDate) : ''})` : 'Não'}</p></div>
                <div><p className="text-xs text-slate-400">Retorno</p><p className="font-semibold text-slate-700">{detailMovement.returnDate ? formatDate(detailMovement.returnDate) : '—'}</p></div>
                <div><p className="text-xs text-slate-400">Recebido por</p><p className="font-semibold text-slate-700">{detailMovement.receivedBy ? users.find((u) => u.id === detailMovement.receivedBy)?.name || '—' : '—'}</p></div>
                <div><p className="text-xs text-slate-400">Condição</p><p className="font-semibold text-slate-700">{detailMovement.returnCondition || '—'}</p></div>
              </div>
              {detailMovement.observations && (
                <div><p className="text-xs text-slate-400">Observações</p><p className="text-sm text-slate-600">{detailMovement.observations}</p></div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setShowDetailModal(null)}>Fechar</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
