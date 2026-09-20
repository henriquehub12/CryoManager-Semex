import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea, Field } from '@/components/ui/Form';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatDateTime, todayStr } from '@/lib/helpers';
import {
  Plus, Clock, AlertTriangle, CheckCircle2, FlaskConical,
  Ruler, ChevronRight, Info,
} from 'lucide-react';
import type { Test } from '@/types';

type TabFilter = 'todos' | 'iniciados' | 'm24h' | 'm48h' | 'hoje' | 'atrasados' | 'concluidos';

export function Testes() {
  const { tanks, tests, users, startTest, record24h, record48h, concludeTest } = useApp();
  const [filter, setFilter] = useState<TabFilter>('todos');
  const [showStartModal, setShowStartModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState<{ testId: string; type: '24h' | '48h' } | null>(null);
  const [showConcludeModal, setShowConcludeModal] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Start test form
  const [selectedTank, setSelectedTank] = useState('');
  const [initialLevel, setInitialLevel] = useState('');
  const [startEmployee, setStartEmployee] = useState('');
  const [startObs, setStartObs] = useState('');
  const [startError, setStartError] = useState('');

  // Measure form
  const [measureLevel, setMeasureLevel] = useState('');
  const [measureEmployee, setMeasureEmployee] = useState('');
  const [measureObs, setMeasureObs] = useState('');

  // Conclude form
  const [concludeResult, setConcludeResult] = useState<'APTO' | 'NAO_APTO'>('APTO');
  const [concludeObs, setConcludeObs] = useState('');

  const today = todayStr();

  const filteredTanks = tanks.filter((t) =>
    t.imob.toLowerCase().includes(search.toLowerCase()) ||
    t.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (t: Test) => {
    if (t.stage === 'CONCLUIDO') return false;
    if (!t.m24h && t.expected24h.slice(0, 10) < today) return true;
    if (t.m24h && !t.m48h && t.expected48h.slice(0, 10) < today) return true;
    return false;
  };

  const isToday = (expected: string) => expected.slice(0, 10) === today;

  const filteredTests = tests.filter((t) => {
    switch (filter) {
      case 'iniciados': return t.stage === 'INICIADO';
      case 'm24h': return t.stage === 'M24H';
      case 'm48h': return t.stage === 'M48H';
      case 'hoje': return t.stage !== 'CONCLUIDO' && (isToday(t.expected24h) || isToday(t.expected48h));
      case 'atrasados': return isOverdue(t);
      case 'concluidos': return t.stage === 'CONCLUIDO';
      default: return true;
    }
  });

  const handleStartTest = () => {
    if (!selectedTank) { setStartError('Selecione um botijão'); return; }
    const level = parseFloat(initialLevel);
    if (isNaN(level) || level <= 0) { setStartError('Informe um nível válido em cm'); return; }
    if (!startEmployee) { setStartError('Selecione o funcionário'); return; }
    startTest(selectedTank, level, startEmployee, startObs);
    setShowStartModal(false);
    setSelectedTank(''); setInitialLevel(''); setStartEmployee(''); setStartObs(''); setStartError('');
  };

  const handleRecordMeasure = () => {
    if (!showMeasureModal) return;
    const level = parseFloat(measureLevel);
    if (isNaN(level) || level <= 0) return;
    if (!measureEmployee) return;
    if (showMeasureModal.type === '24h') {
      record24h(showMeasureModal.testId, level, measureEmployee, measureObs);
    } else {
      record48h(showMeasureModal.testId, level, measureEmployee, measureObs);
    }
    setShowMeasureModal(null);
    setMeasureLevel(''); setMeasureEmployee(''); setMeasureObs('');
  };

  const handleConcludeTest = () => {
    if (!showConcludeModal) return;
    concludeTest(showConcludeModal, concludeResult, concludeObs);
    setShowConcludeModal(null);
    setShowResultModal(showConcludeModal);
    setConcludeResult('APTO'); setConcludeObs('');
  };

  const tabs: { id: TabFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'iniciados', label: 'Iniciados' },
    { id: 'm24h', label: 'Aguardando 24h' },
    { id: 'm48h', label: 'Aguardando 48h' },
    { id: 'hoje', label: 'Medições Hoje' },
    { id: 'atrasados', label: 'Atrasados' },
    { id: 'concluidos', label: 'Concluídos' },
  ];

  const getEmployeeName = (id: string) => users.find((u) => u.id === id)?.name || '—';
  const concludedTest = showResultModal ? tests.find((t) => t.id === showResultModal) : null;
  const concludedTank = concludedTest ? tanks.find((t) => t.id === concludedTest.tankId) : null;

  return (
    <div className="space-y-6">
      {/* Action banner */}
      <Card className="flex flex-col items-start justify-between gap-4 bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">Controle de Testes e Qualidade</h2>
          <p className="mt-1 text-sm text-slate-300">Inicie testes, registre medições de 24h e 48h e classifique os botijões.</p>
        </div>
        <Button variant="success" size="lg" onClick={() => setShowStartModal(true)} className="shrink-0">
          <Plus size={20} />
          Iniciar Novo Teste
        </Button>
      </Card>

      {/* Info note */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          As medições de nitrogênio são registradas em <strong>centímetros (cm)</strong>, medidas com régua.
          Não utilizar litros ou mililitros.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              filter === tab.id ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Test list */}
      <div className="space-y-3">
        {filteredTests.map((test) => {
          const tank = tanks.find((t) => t.id === test.tankId);
          if (!tank) return null;
          const overdue = isOverdue(test);
          const diff24 = test.m24h ? test.initialLevel - test.m24h.level : null;
          const diff48 = test.m48h && test.m24h ? test.m24h.level - test.m48h.level : null;

          return (
            <Card key={test.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Left: tank info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <FlaskConical size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-slate-800">IMOB {tank.imob}</p>
                        <StatusBadge status={tank.status} />
                      </div>
                      <p className="text-xs text-slate-400">{tank.serialNumber} · {tank.modelId === 'm1' ? 'SEMEX20' : tank.modelId === 'm2' ? 'XC-47/11-6' : 'HC-5000'}</p>
                    </div>
                  </div>
                </div>

                {/* Middle: measurements */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-slate-200 p-2.5">
                      <p className="text-[10px] font-medium uppercase text-slate-400">Inicial</p>
                      <p className="text-lg font-bold text-slate-700">{test.initialLevel} cm</p>
                      <p className="text-[10px] text-slate-400">{formatDate(test.startDate)} {test.startTime}</p>
                    </div>
                    <div className={`rounded-lg border p-2.5 ${test.m24h ? 'border-slate-200' : isToday(test.expected24h) ? 'border-blue-300 bg-blue-50' : overdue ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                      <p className="text-[10px] font-medium uppercase text-slate-400">24h</p>
                      <p className="text-lg font-bold text-slate-700">{test.m24h ? `${test.m24h.level} cm` : '—'}</p>
                      <p className="text-[10px] text-slate-400">Prev: {test.expected24h.slice(11)}</p>
                      {diff24 !== null && <p className="text-[10px] font-semibold text-amber-600">Δ {diff24} cm</p>}
                    </div>
                    <div className={`rounded-lg border p-2.5 ${test.m48h ? 'border-slate-200' : isToday(test.expected48h) ? 'border-blue-300 bg-blue-50' : overdue && test.m24h ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                      <p className="text-[10px] font-medium uppercase text-slate-400">48h</p>
                      <p className="text-lg font-bold text-slate-700">{test.m48h ? `${test.m48h.level} cm` : '—'}</p>
                      <p className="text-[10px] text-slate-400">Prev: {test.expected48h.slice(11)}</p>
                      {diff48 !== null && <p className="text-[10px] font-semibold text-amber-600">Δ {diff48} cm</p>}
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                  {overdue && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <AlertTriangle size={12} /> Atrasado
                    </span>
                  )}
                  {test.stage === 'INICIADO' && !test.m24h && (
                    <Button size="sm" onClick={() => setShowMeasureModal({ testId: test.id, type: '24h' })}>
                      <Ruler size={14} /> Registrar 24h
                    </Button>
                  )}
                  {test.stage === 'M24H' && !test.m48h && (
                    <Button size="sm" onClick={() => setShowMeasureModal({ testId: test.id, type: '48h' })}>
                      <Ruler size={14} /> Registrar 48h
                    </Button>
                  )}
                  {test.stage === 'M48H' && (
                    <Button size="sm" variant="success" onClick={() => setShowConcludeModal(test.id)}>
                      <CheckCircle2 size={14} /> Concluir Teste
                    </Button>
                  )}
                  {test.stage === 'CONCLUIDO' && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      test.result === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {test.result === 'APTO' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {test.result === 'APTO' ? 'Apto' : 'Não Apto'}
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400">Por: {getEmployeeName(test.employeeId)}</p>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredTests.length === 0 && (
          <Card className="p-8 text-center">
            <FlaskConical size={32} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">Nenhum teste encontrado neste filtro.</p>
          </Card>
        )}
      </div>

      {/* Start Test Modal */}
      <Modal open={showStartModal} onClose={() => setShowStartModal(false)} title="Iniciar Novo Teste" size="lg">
        <div className="space-y-4">
          <Field label="Buscar botijão por IMOB ou Número de Série">
            <Input placeholder="Digite o IMOB ou série..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </Field>

          {search && (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
              {filteredTanks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTank(t.id); setSearch(''); }}
                  className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${
                    selectedTank === t.id ? 'bg-slate-800 text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">IMOB {t.imob}</p>
                    <p className={`text-xs ${selectedTank === t.id ? 'text-slate-300' : 'text-slate-400'}`}>{t.serialNumber}</p>
                  </div>
                  <ChevronRight size={16} className={selectedTank === t.id ? 'text-slate-300' : 'text-slate-400'} />
                </button>
              ))}
            </div>
          )}

          {selectedTank && (() => {
            const t = tanks.find((tk) => tk.id === selectedTank);
            return t ? (
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-xs text-slate-400">IMOB</p><p className="font-semibold text-slate-700">{t.imob}</p></div>
                  <div><p className="text-xs text-slate-400">Série</p><p className="font-semibold text-slate-700">{t.serialNumber}</p></div>
                  <div><p className="text-xs text-slate-400">Modelo</p><p className="font-semibold text-slate-700">{t.modelId === 'm1' ? 'SEMEX20' : t.modelId === 'm2' ? 'XC-47/11-6' : 'HC-5000'}</p></div>
                </div>
              </div>
            ) : null;
          })()}

          <Field label="Nível inicial de nitrogênio (cm)">
            <Input type="number" step="0.1" placeholder="Ex: 35" value={initialLevel} onChange={(e) => setInitialLevel(e.target.value)} />
          </Field>

          <Field label="Funcionário que iniciou o teste">
            <Select value={startEmployee} onChange={(e) => setStartEmployee(e.target.value)}>
              <option value="">Selecione...</option>
              {users.filter((u) => u.active).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Observações">
            <Textarea rows={2} placeholder="Observações opcionais..." value={startObs} onChange={(e) => setStartObs(e.target.value)} />
          </Field>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700">
              <Clock size={12} className="inline mr-1" />
              O sistema calculará automaticamente os horários previstos para as medições de 24h e 48h.
            </p>
          </div>

          {startError && <p className="text-sm text-red-600">{startError}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowStartModal(false)}>Cancelar</Button>
            <Button onClick={handleStartTest}>Iniciar Teste</Button>
          </div>
        </div>
      </Modal>

      {/* Measure Modal */}
      <Modal
        open={!!showMeasureModal}
        onClose={() => setShowMeasureModal(null)}
        title={`Registrar Medição de ${showMeasureModal?.type === '24h' ? '24h' : '48h'}`}
      >
        <div className="space-y-4">
          <Field label={`Nível de nitrogênio (cm) — Medição de ${showMeasureModal?.type === '24h' ? '24h' : '48h'}`}>
            <Input type="number" step="0.1" placeholder="Ex: 33" value={measureLevel} onChange={(e) => setMeasureLevel(e.target.value)} />
          </Field>
          <Field label="Funcionário">
            <Select value={measureEmployee} onChange={(e) => setMeasureEmployee(e.target.value)}>
              <option value="">Selecione...</option>
              {users.filter((u) => u.active).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Observações">
            <Textarea rows={2} placeholder="Observações opcionais..." value={measureObs} onChange={(e) => setMeasureObs(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowMeasureModal(null)}>Cancelar</Button>
            <Button onClick={handleRecordMeasure}>Registrar</Button>
          </div>
        </div>
      </Modal>

      {/* Conclude Modal */}
      <Modal open={!!showConcludeModal} onClose={() => setShowConcludeModal(null)} title="Concluir Teste — Classificação">
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-700">
              A decisão de APTO ou NÃO APTO deve seguir os procedimentos internos da empresa.
              O sistema não define critérios técnicos automáticos.
            </p>
          </div>
          <Field label="Resultado do teste">
            <div className="flex gap-3">
              <button
                onClick={() => setConcludeResult('APTO')}
                className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                  concludeResult === 'APTO' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                <p className="mt-1 font-bold text-slate-700">APTO</p>
              </button>
              <button
                onClick={() => setConcludeResult('NAO_APTO')}
                className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                  concludeResult === 'NAO_APTO' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle size={24} className="mx-auto text-red-600" />
                <p className="mt-1 font-bold text-slate-700">NÃO APTO</p>
              </button>
            </div>
          </Field>
          <Field label="Observações">
            <Textarea rows={2} placeholder="Observações sobre o resultado..." value={concludeObs} onChange={(e) => setConcludeObs(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowConcludeModal(null)}>Cancelar</Button>
            <Button variant="success" onClick={handleConcludeTest}>Confirmar Resultado</Button>
          </div>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal open={!!showResultModal} onClose={() => setShowResultModal(null)} title="Resultado do Teste">
        {concludedTest && concludedTank && (
          <div className="space-y-3">
            <div className={`rounded-xl p-5 text-center ${concludedTest.result === 'APTO' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {concludedTest.result === 'APTO' ? (
                <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
              ) : (
                <AlertTriangle size={48} className="mx-auto text-red-600" />
              )}
              <p className="mt-2 text-2xl font-bold text-slate-800">{concludedTest.result === 'APTO' ? 'APTO' : 'NÃO APTO'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">IMOB</p><p className="font-semibold text-slate-700">{concludedTank.imob}</p></div>
              <div><p className="text-xs text-slate-400">Série</p><p className="font-semibold text-slate-700">{concludedTank.serialNumber}</p></div>
              <div><p className="text-xs text-slate-400">Modelo</p><p className="font-semibold text-slate-700">{concludedTank.modelId === 'm1' ? 'SEMEX20' : concludedTank.modelId === 'm2' ? 'XC-47/11-6' : 'HC-5000'}</p></div>
              <div><p className="text-xs text-slate-400">Início</p><p className="font-semibold text-slate-700">{formatDateTime(concludedTest.startDate, concludedTest.startTime)}</p></div>
              <div><p className="text-xs text-slate-400">Nível inicial</p><p className="font-semibold text-slate-700">{concludedTest.initialLevel} cm</p></div>
              <div><p className="text-xs text-slate-400">24h</p><p className="font-semibold text-slate-700">{concludedTest.m24h ? `${concludedTest.m24h.level} cm` : '—'}</p></div>
              <div><p className="text-xs text-slate-400">48h</p><p className="font-semibold text-slate-700">{concludedTest.m48h ? `${concludedTest.m48h.level} cm` : '—'}</p></div>
              <div><p className="text-xs text-slate-400">Realizado por</p><p className="font-semibold text-slate-700">{getEmployeeName(concludedTest.employeeId)}</p></div>
            </div>
            {concludedTest.observations && (
              <div><p className="text-xs text-slate-400">Observações</p><p className="text-sm text-slate-600">{concludedTest.observations}</p></div>
            )}
            <div className="flex gap-2 border-t border-slate-200 pt-3">
              <Button variant="secondary" size="sm" className="flex-1">Simular E-mail</Button>
              <Button variant="secondary" size="sm" className="flex-1">Simular Relatório</Button>
              <Button variant="secondary" size="sm" className="flex-1">Simular Notificação</Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowResultModal(null)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
