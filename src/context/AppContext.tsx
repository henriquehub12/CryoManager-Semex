import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  AppState,
  UserModel,
  TankModel,
  Test,
  Movement,
  ModelModel,
  Representative,
  Carrier,
  SectorResponsible,
  Notification,
  AuditEntry,
  Role,
} from '@/types';
import { seedData } from '@/data/seed';

interface AppContextType extends AppState {
  switchUser: (userId: string) => void;
  addTank: (tank: Omit<TankModel, 'id' | 'createdAt' | 'status'>) => { ok: boolean; error?: string };
  updateTank: (id: string, updates: Partial<TankModel>) => void;
  addModel: (name: string) => void;
  startTest: (tankId: string, initialLevel: number, employeeId: string, observations: string) => void;
  record24h: (testId: string, level: number, employeeId: string, observations: string) => void;
  record48h: (testId: string, level: number, employeeId: string, observations: string) => void;
  concludeTest: (testId: string, result: 'APTO' | 'NAO_APTO', observations: string) => void;
  createMovement: (m: Omit<Movement, 'id' | 'status'>) => void;
  updateMovement: (id: string, updates: Partial<Movement>) => void;
  registerReturn: (movementId: string, receivedBy: string, condition: string, observations: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addResponsible: (r: Omit<SectorResponsible, 'id'>) => void;
  setMainResponsible: (id: string) => void;
  toggleUserActive: (userId: string) => void;
  addAudit: (action: string, entity: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seedData);

  const addAudit = (action: string, entity: string) => {
    setState((prev) => ({
      ...prev,
      audit: [
        {
          id: `a${prev.audit.length + 1}`,
          user: prev.currentUser.name,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 5),
          action,
          entity,
        },
        ...prev.audit,
      ],
    }));
  };

  const switchUser = (userId: string) => {
    setState((prev) => ({
      ...prev,
      currentUser: prev.users.find((u) => u.id === userId) || prev.currentUser,
    }));
  };

  const addTank: AppContextType['addTank'] = (tank) => {
    let result: { ok: boolean; error?: string } = { ok: true };
    setState((prev) => {
      if (prev.tanks.some((t) => t.serialNumber === tank.serialNumber)) {
        result = { ok: false, error: 'Número de série já cadastrado' };
        return prev;
      }
      const newTank: TankModel = {
        ...tank,
        id: `t${prev.tanks.length + 1}`,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'AGUARDANDO_TESTE',
      };
      return { ...prev, tanks: [...prev.tanks, newTank] };
    });
    if (result.ok) addAudit('Botijão cadastrado', `IMOB ${tank.imob}`);
    return result;
  };

  const updateTank = (id: string, updates: Partial<TankModel>) => {
    setState((prev) => ({
      ...prev,
      tanks: prev.tanks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const addModel = (name: string) => {
    setState((prev) => ({
      ...prev,
      models: [...prev.models, { id: `m${prev.models.length + 1}`, name, active: true }],
    }));
    addAudit('Modelo adicionado', name);
  };

  const startTest = (tankId: string, initialLevel: number, employeeId: string, observations: string) => {
    const tank = state.tanks.find((t) => t.id === tankId);
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const startTime = now.toTimeString().slice(0, 5);
    const expected24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expected48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const fmt = (d: Date) => `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;

    setState((prev) => ({
      ...prev,
      tests: [
        {
          id: `test${prev.tests.length + 1}`,
          tankId,
          startDate,
          startTime,
          employeeId,
          initialLevel,
          m24h: null,
          m48h: null,
          expected24h: fmt(expected24),
          expected48h: fmt(expected48),
          result: 'PENDENTE',
          observations,
          stage: 'INICIADO',
          concludedAt: null,
        },
        ...prev.tests,
      ],
      tanks: prev.tanks.map((t) => (t.id === tankId ? { ...t, status: 'EM_TESTE' } : t)),
    }));
    addAudit('Teste iniciado', `IMOB ${tank?.imob || ''}`);
  };

  const record24h = (testId: string, level: number, employeeId: string, observations: string) => {
    const now = new Date();
    setState((prev) => ({
      ...prev,
      tests: prev.tests.map((t) =>
        t.id === testId
          ? {
              ...t,
              m24h: {
                level,
                date: now.toISOString().slice(0, 10),
                time: now.toTimeString().slice(0, 5),
                employeeId,
                observations,
              },
              stage: 'M24H',
            }
          : t
      ),
    }));
    const test = state.tests.find((t) => t.id === testId);
    const tank = state.tanks.find((t) => t.id === test?.tankId);
    addAudit('Medição 24h registrada', `IMOB ${tank?.imob || ''}`);
  };

  const record48h = (testId: string, level: number, employeeId: string, observations: string) => {
    const now = new Date();
    setState((prev) => ({
      ...prev,
      tests: prev.tests.map((t) =>
        t.id === testId
          ? {
              ...t,
              m48h: {
                level,
                date: now.toISOString().slice(0, 10),
                time: now.toTimeString().slice(0, 5),
                employeeId,
                observations,
              },
              stage: 'M48H',
            }
          : t
      ),
    }));
    const test = state.tests.find((t) => t.id === testId);
    const tank = state.tanks.find((t) => t.id === test?.tankId);
    addAudit('Medição 48h registrada', `IMOB ${tank?.imob || ''}`);
  };

  const concludeTest = (testId: string, result: 'APTO' | 'NAO_APTO', observations: string) => {
    const test = state.tests.find((t) => t.id === testId);
    const tank = state.tanks.find((t) => t.id === test?.tankId);
    const now = new Date();
    setState((prev) => ({
      ...prev,
      tests: prev.tests.map((t) =>
        t.id === testId
          ? { ...t, result, observations, stage: 'CONCLUIDO', concludedAt: now.toISOString() }
          : t
      ),
      tanks: prev.tanks.map((t) =>
        t.id === test?.tankId
          ? { ...t, status: result === 'APTO' ? 'APTO' : 'NAO_APTO' }
          : t
      ),
    }));
    addAudit(`IMOB ${tank?.imob || ''} marcado como ${result}`, `IMOB ${tank?.imob || ''}`);
  };

  const createMovement: AppContextType['createMovement'] = (m) => {
    setState((prev) => ({
      ...prev,
      movements: [
        { ...m, id: `mv${prev.movements.length + 1}`, status: 'EM_PREPARACAO' },
        ...prev.movements,
      ],
      tanks: prev.tanks.map((t) =>
        t.id === m.tankId ? { ...t, status: 'EM_PREPARACAO' } : t
      ),
    }));
    const tank = state.tanks.find((t) => t.id === m.tankId);
    addAudit('Saída registrada', `IMOB ${tank?.imob || ''}`);
  };

  const updateMovement = (id: string, updates: Partial<Movement>) => {
    setState((prev) => ({
      ...prev,
      movements: prev.movements.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  const registerReturn = (movementId: string, receivedBy: string, condition: string, observations: string) => {
    const mv = state.movements.find((m) => m.id === movementId);
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      movements: prev.movements.map((m) =>
        m.id === movementId
          ? { ...m, returnDate: today, receivedBy, returnCondition: condition, observations, status: 'AGUARDANDO_NOVO_TESTE' }
          : m
      ),
      tanks: prev.tanks.map((t) =>
        t.id === mv?.tankId ? { ...t, status: 'AGUARDANDO_NOVO_TESTE' } : t
      ),
    }));
    const tank = state.tanks.find((t) => t.id === mv?.tankId);
    addAudit('Retorno registrado', `IMOB ${tank?.imob || ''}`);
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const addResponsible: AppContextType['addResponsible'] = (r) => {
    setState((prev) => ({
      ...prev,
      responsibles: [
        ...prev.responsibles.map((res) => (r.isMain ? { ...res, isMain: false } : res)),
        { ...r, id: `sr${prev.responsibles.length + 1}` },
      ],
    }));
    addAudit('Responsável cadastrado', r.name);
  };

  const setMainResponsible = (id: string) => {
    setState((prev) => ({
      ...prev,
      responsibles: prev.responsibles.map((r) => ({ ...r, isMain: r.id === id })),
    }));
    addAudit('Responsável principal alterado', id);
  };

  const toggleUserActive = (userId: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        switchUser,
        addTank,
        updateTank,
        addModel,
        startTest,
        record24h,
        record48h,
        concludeTest,
        createMovement,
        updateMovement,
        registerReturn,
        markNotificationRead,
        markAllNotificationsRead,
        addResponsible,
        setMainResponsible,
        toggleUserActive,
        addAudit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
