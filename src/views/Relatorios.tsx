import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { formatDate } from '@/lib/helpers';
import { FileSpreadsheet, FileText, Filter, Download } from 'lucide-react';

export function Relatorios() {
  const { tanks, tests, movements, users, representatives, models } = useApp();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [imobFilter, setImobFilter] = useState('');
  const [serialFilter, setSerialFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [repFilter, setRepFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getModelName = (id: string) => models.find((m) => m.id === id)?.name || '—';
  const getEmployeeName = (id: string) => users.find((u) => u.id === id)?.name || '—';

  const filteredTests = tests.filter((t) => {
    const tank = tanks.find((tk) => tk.id === t.tankId);
    if (!tank) return false;
    if (dateFrom && t.startDate < dateFrom) return false;
    if (dateTo && t.startDate > dateTo) return false;
    if (imobFilter && !tank.imob.includes(imobFilter)) return false;
    if (serialFilter && !tank.serialNumber.includes(serialFilter)) return false;
    if (modelFilter !== 'all' && tank.modelId !== modelFilter) return false;
    if (employeeFilter !== 'all' && t.employeeId !== employeeFilter) return false;
    if (resultFilter !== 'all' && t.result !== resultFilter) return false;
    return true;
  });

  const filteredMovements = movements.filter((m) => {
    const tank = tanks.find((t) => t.id === m.tankId);
    if (!tank) return false;
    if (dateFrom && m.exitDate < dateFrom) return false;
    if (dateTo && m.exitDate > dateTo) return false;
    if (imobFilter && !tank.imob.includes(imobFilter)) return false;
    if (serialFilter && !tank.serialNumber.includes(serialFilter)) return false;
    if (modelFilter !== 'all' && tank.modelId !== modelFilter) return false;
    if (repFilter !== 'all' && m.representativeId !== repFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    totalTests: filteredTests.length,
    aptos: filteredTests.filter((t) => t.result === 'APTO').length,
    naoAptos: filteredTests.filter((t) => t.result === 'NAO_APTO').length,
    emTeste: filteredTests.filter((t) => t.result === 'PENDENTE').length,
    atrasados: filteredTests.filter((t) => {
      const today = new Date().toISOString().slice(0, 10);
      if (t.stage === 'CONCLUIDO') return false;
      if (!t.m24h && t.expected24h.slice(0, 10) < today) return true;
      if (t.m24h && !t.m48h && t.expected48h.slice(0, 10) < today) return true;
      return false;
    }).length,
    fora: filteredMovements.filter((m) => ['EM_TRANSPORTE', 'ENTREGUE', 'AGUARDANDO_COLETA', 'RETORNANDO'].includes(m.status)).length,
    retornos: filteredMovements.filter((m) => m.returnDate).length,
    movimentacoes: filteredMovements.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Relatórios</h2>
          <p className="text-sm text-slate-500">Filtre e exporte relatórios de testes e movimentações.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => alert('Simulação: O relatório seria exportado para Excel.')}>
            <FileSpreadsheet size={18} /> Exportar Excel
          </Button>
          <Button variant="secondary" onClick={() => alert('Simulação: O relatório seria exportado para PDF.')}>
            <FileText size={18} /> Gerar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">Filtros</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Data de</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Data até</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">IMOB</label>
            <Input placeholder="Ex: 450" value={imobFilter} onChange={(e) => setImobFilter(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Série</label>
            <Input placeholder="Ex: DEMO" value={serialFilter} onChange={(e) => setSerialFilter(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Modelo</label>
            <Select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
              <option value="all">Todos</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Funcionário</label>
            <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="all">Todos</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Representante</label>
            <Select value={repFilter} onChange={(e) => setRepFilter(e.target.value)}>
              <option value="all">Todos</option>
              {representatives.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Resultado</label>
            <Select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="APTO">Apto</option>
              <option value="NAO_APTO">Não Apto</option>
              <option value="PENDENTE">Pendente</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-slate-400">Testes Realizados</p><p className="text-2xl font-bold text-slate-800">{stats.totalTests}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Aptos</p><p className="text-2xl font-bold text-emerald-600">{stats.aptos}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Não Aptos</p><p className="text-2xl font-bold text-red-600">{stats.naoAptos}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Atrasados</p><p className="text-2xl font-bold text-amber-600">{stats.atrasados}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Em Teste</p><p className="text-2xl font-bold text-slate-700">{stats.emTeste}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Botijões Fora</p><p className="text-2xl font-bold text-indigo-600">{stats.fora}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Retornos</p><p className="text-2xl font-bold text-sky-600">{stats.retornos}</p></Card>
        <Card className="p-4"><p className="text-xs text-slate-400">Movimentações</p><p className="text-2xl font-bold text-slate-700">{stats.movimentacoes}</p></Card>
      </div>

      {/* Test results table */}
      <Card className="overflow-x-auto">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700">Relatório de Testes</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-semibold">IMOB</th>
              <th className="px-4 py-3 font-semibold">Série</th>
              <th className="px-4 py-3 font-semibold">Modelo</th>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Inicial</th>
              <th className="px-4 py-3 font-semibold">24h</th>
              <th className="px-4 py-3 font-semibold">48h</th>
              <th className="px-4 py-3 font-semibold">Resultado</th>
              <th className="px-4 py-3 font-semibold">Funcionário</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((t) => {
              const tank = tanks.find((tk) => tk.id === t.tankId);
              return (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{tank?.imob}</td>
                  <td className="px-4 py-3 text-slate-500">{tank?.serialNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{tank ? getModelName(tank.modelId) : '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(t.startDate)}</td>
                  <td className="px-4 py-3 text-slate-500">{t.initialLevel} cm</td>
                  <td className="px-4 py-3 text-slate-500">{t.m24h ? `${t.m24h.level} cm` : '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{t.m48h ? `${t.m48h.level} cm` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      t.result === 'APTO' ? 'bg-emerald-100 text-emerald-700' :
                      t.result === 'NAO_APTO' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.result === 'APTO' ? 'Apto' : t.result === 'NAO_APTO' ? 'Não Apto' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{getEmployeeName(t.employeeId)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTests.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Nenhum teste encontrado com os filtros aplicados.</p>}
      </Card>

      {/* Movements table */}
      <Card className="overflow-x-auto">
        <div className="border-b border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700">Relatório de Movimentações</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-semibold">IMOB</th>
              <th className="px-4 py-3 font-semibold">Representante</th>
              <th className="px-4 py-3 font-semibold">Saída</th>
              <th className="px-4 py-3 font-semibold">NF</th>
              <th className="px-4 py-3 font-semibold">Doses</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Retorno</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((m) => {
              const tank = tanks.find((t) => t.id === m.tankId);
              const rep = representatives.find((r) => r.id === m.representativeId);
              return (
                <tr key={m.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{tank?.imob}</td>
                  <td className="px-4 py-3 text-slate-500">{rep?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(m.exitDate)}</td>
                  <td className="px-4 py-3 text-slate-500">{m.invoice}</td>
                  <td className="px-4 py-3 text-slate-500">{m.doseCount}</td>
                  <td className="px-4 py-3 text-slate-500">{m.status.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-500">{m.returnDate ? formatDate(m.returnDate) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredMovements.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Nenhuma movimentação encontrada.</p>}
      </Card>
    </div>
  );
}
