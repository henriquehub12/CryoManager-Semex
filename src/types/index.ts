export type TankStatus =
  | 'AGUARDANDO_TESTE'
  | 'EM_TESTE'
  | 'APTO'
  | 'NAO_APTO'
  | 'SEPARADO'
  | 'EM_PREPARACAO'
  | 'EM_TRANSPORTE'
  | 'ENTREGUE'
  | 'AGUARDANDO_COLETA'
  | 'RETORNANDO'
  | 'RETORNADO'
  | 'AGUARDANDO_NOVO_TESTE';

export type TestResult = 'APTO' | 'NAO_APTO' | 'PENDENTE';

export type TestStage = 'INICIADO' | 'M24H' | 'M48H' | 'CONCLUIDO';

export type Role = 'OPERACIONAL' | 'ADMINISTRADOR';

export interface UserModel {
  id: string;
  name: string;
  role: Role;
  active: boolean;
}

export interface TankModel {
  id: string;
  imob: string;
  serialNumber: string;
  modelId: string;
  createdAt: string;
  status: TankStatus;
  observations: string;
}

export interface ModelModel {
  id: string;
  name: string;
  active: boolean;
}

export interface Measurement {
  level: number;
  date: string;
  time: string;
  employeeId: string;
  observations: string;
}

export interface Test {
  id: string;
  tankId: string;
  startDate: string;
  startTime: string;
  employeeId: string;
  initialLevel: number;
  m24h: Measurement | null;
  m48h: Measurement | null;
  expected24h: string;
  expected48h: string;
  result: TestResult;
  observations: string;
  stage: TestStage;
  concludedAt: string | null;
}

export interface Representative {
  id: string;
  name: string;
  regional: string;
  uf: string;
  active: boolean;
}

export interface Carrier {
  id: string;
  name: string;
  active: boolean;
}

export interface Movement {
  id: string;
  tankId: string;
  representativeId: string;
  regional: string;
  uf: string;
  carrierId: string;
  exitDate: string;
  invoice: string;
  orderNumber: string;
  orderCount: number;
  doseCount: number;
  deadline: string;
  deliveryForecast: string;
  deliveryDate: string | null;
  collectionRequested: boolean;
  collectionDate: string | null;
  returnDate: string | null;
  receivedBy: string | null;
  returnCondition: string;
  observations: string;
  status: TankStatus;
}

export interface Notification {
  id: string;
  type: 'M24H' | 'M48H' | 'TESTE_ATRASADO' | 'NAO_APTO' | 'AGUARDANDO_COLETA' | 'RETORNO_ATRASADO';
  message: string;
  tankId: string;
  date: string;
  read: boolean;
}

export interface SectorResponsible {
  id: string;
  name: string;
  role: string;
  email: string;
  active: boolean;
  isMain: boolean;
}

export interface AuditEntry {
  id: string;
  user: string;
  date: string;
  time: string;
  action: string;
  entity: string;
}

export interface AppState {
  currentUser: UserModel;
  users: UserModel[];
  tanks: TankModel[];
  models: ModelModel[];
  tests: Test[];
  representatives: Representative[];
  carriers: Carrier[];
  movements: Movement[];
  notifications: Notification[];
  responsibles: SectorResponsible[];
  audit: AuditEntry[];
}
