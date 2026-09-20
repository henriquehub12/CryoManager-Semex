import type { TankStatus, TestResult } from '@/types';

export const statusConfig: Record<TankStatus, { label: string; color: string; dot: string }> = {
  AGUARDANDO_TESTE: { label: 'Aguardando Teste', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  EM_TESTE: { label: 'Em Teste', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  APTO: { label: 'Apto', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  NAO_APTO: { label: 'Não Apto', color: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' },
  SEPARADO: { label: 'Separado', color: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' },
  EM_PREPARACAO: { label: 'Em Preparação', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', dot: 'bg-cyan-500' },
  EM_TRANSPORTE: { label: 'Em Transporte', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', dot: 'bg-indigo-500' },
  ENTREGUE: { label: 'Entregue', color: 'bg-teal-100 text-teal-800 border-teal-300', dot: 'bg-teal-500' },
  AGUARDANDO_COLETA: { label: 'Aguardando Coleta', color: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500' },
  RETORNANDO: { label: 'Retornando', color: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-500' },
  RETORNADO: { label: 'Retornado', color: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-500' },
  AGUARDANDO_NOVO_TESTE: { label: 'Aguardando Novo Teste', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
};

export const resultConfig: Record<TestResult, { label: string; color: string }> = {
  APTO: { label: 'Apto', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  NAO_APTO: { label: 'Não Apto', color: 'bg-red-100 text-red-800 border-red-300' },
  PENDENTE: { label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-300' },
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} ${timeStr}`;
}

export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1).getTime();
  const d2 = new Date(dateStr2).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
