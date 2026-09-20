import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Field } from '@/components/ui/Form';
import { formatDate } from '@/lib/helpers';
import {
  Users, Package, Shield, ScrollText, Plus, Check, UserCog,
  QrCode, Upload, FileSpreadsheet,
} from 'lucide-react';
import type { Role } from '@/types';

type AdminTab = 'usuarios' | 'modelos' | 'responsavel' | 'auditoria' | 'futuro';

export function Administracao() {
  const { users, models, responsibles, audit, addModel, addResponsible, setMainResponsible, toggleUserActive, currentUser } = useApp();
  const [tab, setTab] = useState<AdminTab>('usuarios');
  const [showModelModal, setShowModelModal] = useState(false);
  const [showRespModal, setShowRespModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [respName, setRespName] = useState('');
  const [respRole, setRespRole] = useState('');
  const [respEmail, setRespEmail] = useState('');

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: 'usuarios', label: 'Usuários e Permissões', icon: Users },
    { id: 'modelos', label: 'Modelos', icon: Package },
    { id: 'responsavel', label: 'Responsável do Setor', icon: Shield },
    { id: 'auditoria', label: 'Auditoria', icon: ScrollText },
    { id: 'futuro', label: 'Futuro', icon: Upload },
  ];

  const handleAddModel = () => {
    if (!newModelName) return;
    addModel(newModelName);
    setShowModelModal(false);
    setNewModelName('');
  };

  const handleAddResp = () => {
    if (!respName || !respRole) return;
    addResponsible({ name: respName, role: respRole, email: respEmail, active: true, isMain: false });
    setShowRespModal(false);
    setRespName(''); setRespRole(''); setRespEmail('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Administração</h2>
        <p className="text-sm text-slate-500">Gerenciamento de usuários, modelos, responsável e auditoria.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                tab === t.id ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Users */}
      {tab === 'usuarios' && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Perfil</th>
                <th className="px-4 py-3 font-semibold">Permissões</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{u.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === 'ADMINISTRADOR' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'ADMINISTRADOR' ? 'Administrador' : 'Operacional'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.role === 'ADMINISTRADOR'
                      ? 'Acesso total, relatórios, gestão de usuários, auditoria'
                      : 'Consultas, testes, medições, saídas, retornos'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span className={`h-2 w-2 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== currentUser.id && (
                      <Button size="sm" variant="ghost" onClick={() => toggleUserActive(u.id)}>
                        {u.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Models */}
      {tab === 'modelos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowModelModal(true)}><Plus size={16} /> Adicionar Modelo</Button>
          </div>
          <Card className="p-4">
            <div className="space-y-2">
              {models.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-slate-500" />
                    <p className="font-semibold text-slate-700">{m.name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${m.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`h-2 w-2 rounded-full ${m.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {m.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Responsible */}
      {tab === 'responsavel' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowRespModal(true)}><Plus size={16} /> Cadastrar Responsável</Button>
          </div>
          {(() => {
            const main = responsibles.find((r) => r.isMain);
            return (
              <Card className="p-5">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Responsável Principal</p>
                    <p className="text-lg font-bold text-slate-800">{main?.name}</p>
                    <p className="text-sm text-slate-500">{main?.role} · {main?.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-bold text-slate-600">Todos os Responsáveis</p>
                  {responsibles.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center gap-3">
                        <UserCog size={18} className="text-slate-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{r.name}</p>
                          <p className="text-xs text-slate-400">{r.role} · {r.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.isMain ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            <Check size={12} /> Principal
                          </span>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setMainResponsible(r.id)}>
                            Definir como principal
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Audit */}
      {tab === 'auditoria' && (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-700">Registro de Auditoria</h3>
          <div className="space-y-2">
            {audit.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <ScrollText size={16} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{a.action}</span>
                    <span className="text-slate-400"> · {a.entity}</span>
                  </p>
                  <p className="text-xs text-slate-400">{a.user} · {formatDate(a.date)} {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Future features */}
      {tab === 'futuro' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <QrCode size={24} className="text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">QR Code</p>
                <p className="text-sm text-slate-500">Futura leitura de QR Code para acesso rápido à ficha do botijão.</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Fluxo previsto: QR Code → Ficha do Botijão → IMOB → Histórico → Ações
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <FileSpreadsheet size={24} className="text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Importação de Excel</p>
                <p className="text-sm text-slate-500">Importação futura de dados existentes (IMOB, modelo, série, representantes, etc.).</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              No sistema oficial, será possível importar planilhas existentes para cadastro em lote.
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Upload size={24} className="text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Integrações Empresariais</p>
                <p className="text-sm text-slate-500">E-mail, notificações externas e integração com sistemas da empresa.</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Shield size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Regras Técnicas</p>
                <p className="text-sm text-slate-500">Parâmetros de aprovação automática serão definidos pela empresa.</p>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              Regra a ser definida pela empresa — o sistema não inventa critérios técnicos.
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <Modal open={showModelModal} onClose={() => setShowModelModal(false)} title="Adicionar Modelo">
        <div className="space-y-4">
          <Field label="Nome do modelo">
            <Input placeholder="Ex: HC-5000" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModelModal(false)}>Cancelar</Button>
            <Button onClick={handleAddModel}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showRespModal} onClose={() => setShowRespModal(false)} title="Cadastrar Responsável">
        <div className="space-y-4">
          <Field label="Nome"><Input placeholder="Ex: João Silva" value={respName} onChange={(e) => setRespName(e.target.value)} /></Field>
          <Field label="Cargo"><Input placeholder="Ex: Coordenador de Qualidade" value={respRole} onChange={(e) => setRespRole(e.target.value)} /></Field>
          <Field label="E-mail"><Input type="email" placeholder="Ex: joao@demo.com" value={respEmail} onChange={(e) => setRespEmail(e.target.value)} /></Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRespModal(false)}>Cancelar</Button>
            <Button onClick={handleAddResp}>Cadastrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
