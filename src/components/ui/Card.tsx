import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white ${onClick ? 'cursor-pointer transition-all hover:border-slate-300 hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, color, subtitle, onClick }: StatCardProps) {
  return (
    <Card onClick={onClick} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
