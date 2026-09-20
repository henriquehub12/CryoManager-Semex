import type {
  AppState,
  TankModel,
  Test,
  Movement,
  UserModel,
  Representative,
  Carrier,
  SectorResponsible,
  ModelModel,
  Notification,
  AuditEntry,
} from '@/types';

const employees: UserModel[] = [
  { id: 'u1', name: 'Carlos Mendes', role: 'ADMINISTRADOR', active: true },
  { id: 'u2', name: 'Ana Ribeiro', role: 'OPERACIONAL', active: true },
  { id: 'u3', name: 'Bruno Faria', role: 'OPERACIONAL', active: true },
  { id: 'u4', name: 'Diana Sousa', role: 'ADMINISTRADOR', active: true },
  { id: 'u5', name: 'Eduardo Lima', role: 'OPERACIONAL', active: false },
];

const models: ModelModel[] = [
  { id: 'm1', name: 'SEMEX20', active: true },
  { id: 'm2', name: 'XC-47/11-6', active: true },
  { id: 'm3', name: 'HC-5000', active: true },
];

const representatives: Representative[] = [
  { id: 'r1', name: 'Agropecuária Vale Verde', regional: 'Centro-Oeste', uf: 'GO', active: true },
  { id: 'r2', name: 'Fazenda Santa Helena', regional: 'Sudeste', uf: 'MG', active: true },
  { id: 'r3', name: 'Pecuária Norte Sul', regional: 'Norte', uf: 'PA', active: true },
  { id: 'r4', name: 'Cattle Prime Representações', regional: 'Sul', uf: 'PR', active: true },
  { id: 'r5', name: 'Genética Boa Vista', regional: 'Nordeste', uf: 'BA', active: true },
];

const carriers: Carrier[] = [
  { id: 'c1', name: 'Expresso Nitrogênio LTDA', active: true },
  { id: 'c2', name: 'Transportes Gelada Express', active: true },
  { id: 'c3', name: 'CryoLog Transportes', active: true },
];

const responsibles: SectorResponsible[] = [
  { id: 'sr1', name: 'Carlos Mendes', role: 'Coordenador de Qualidade', email: 'carlos.mendes@demo.com', active: true, isMain: true },
  { id: 'sr2', name: 'Diana Sousa', role: 'Supervisora Técnica', email: 'diana.sousa@demo.com', active: true, isMain: false },
];

const tanks: TankModel[] = [
  { id: 't1', imob: '450', serialNumber: 'DEMO2026001', modelId: 'm1', createdAt: '2026-01-15', status: 'APTO', observations: 'Revisão em dia' },
  { id: 't2', imob: '451', serialNumber: 'DEMO2026002', modelId: 'm2', createdAt: '2026-01-20', status: 'EM_TESTE', observations: '' },
  { id: 't3', imob: '452', serialNumber: 'DEMO2026003', modelId: 'm1', createdAt: '2026-02-01', status: 'NAO_APTO', observations: 'Vazamento detectado na base' },
  { id: 't4', imob: '453', serialNumber: 'DEMO2026004', modelId: 'm1', createdAt: '2026-02-10', status: 'AGUARDANDO_TESTE', observations: '' },
  { id: 't5', imob: '454', serialNumber: 'DEMO2026005', modelId: 'm2', createdAt: '2026-02-15', status: 'EM_TRANSPORTE', observations: '' },
  { id: 't6', imob: '455', serialNumber: 'DEMO2026006', modelId: 'm1', createdAt: '2026-03-01', status: 'ENTREGUE', observations: '' },
  { id: 't7', imob: '456', serialNumber: 'DEMO2026007', modelId: 'm2', createdAt: '2026-03-05', status: 'AGUARDANDO_COLETA', observations: 'Representante solicitou coleta' },
  { id: 't8', imob: '457', serialNumber: 'DEMO2026008', modelId: 'm1', createdAt: '2026-03-10', status: 'RETORNADO', observations: '' },
  { id: 't9', imob: '458', serialNumber: 'DEMO2026009', modelId: 'm1', createdAt: '2026-03-15', status: 'AGUARDANDO_NOVO_TESTE', observations: 'Retornou em bom estado' },
  { id: 't10', imob: '459', serialNumber: 'DEMO2026010', modelId: 'm2', createdAt: '2026-03-20', status: 'APTO', observations: '' },
  { id: 't11', imob: '460', serialNumber: 'DEMO2026011', modelId: 'm1', createdAt: '2026-04-01', status: 'EM_TESTE', observations: 'Segundo teste após retorno' },
  { id: 't12', imob: '461', serialNumber: 'DEMO2026012', modelId: 'm2', createdAt: '2026-04-05', status: 'SEPARADO', observations: 'Reservado para envio' },
  { id: 't13', imob: '462', serialNumber: 'DEMO2026013', modelId: 'm1', createdAt: '2026-04-10', status: 'APTO', observations: '' },
  { id: 't14', imob: '463', serialNumber: 'DEMO2026014', modelId: 'm1', createdAt: '2026-04-15', status: 'RETORNANDO', observations: '' },
  { id: 't15', imob: '464', serialNumber: 'DEMO2026015', modelId: 'm2', createdAt: '2026-04-20', status: 'AGUARDANDO_TESTE', observations: 'Novo cadastro' },
];

// Tests — using dates relative to 2026-09-20 (current date)
const tests: Test[] = [
  // Completed tests (historical)
  {
    id: 'test1', tankId: 't1', startDate: '2026-08-10', startTime: '08:00', employeeId: 'u2',
    initialLevel: 35, m24h: { level: 33, date: '2026-08-11', time: '08:05', employeeId: 'u2', observations: '' },
    m48h: { level: 31, date: '2026-08-12', time: '07:55', employeeId: 'u2', observations: '' },
    expected24h: '2026-08-11 08:00', expected48h: '2026-08-12 08:00',
    result: 'APTO', observations: 'Desempenho satisfatório', stage: 'CONCLUIDO', concludedAt: '2026-08-12 08:10',
  },
  {
    id: 'test2', tankId: 't3', startDate: '2026-07-15', startTime: '09:00', employeeId: 'u3',
    initialLevel: 34, m24h: { level: 28, date: '2026-07-16', time: '09:10', employeeId: 'u3', observations: 'Queda acentuada' },
    m48h: { level: 20, date: '2026-07-17', time: '09:00', employeeId: 'u3', observations: 'Vazamento confirmado' },
    expected24h: '2026-07-16 09:00', expected48h: '2026-07-17 09:00',
    result: 'NAO_APTO', observations: 'Perda de 14cm em 48h', stage: 'CONCLUIDO', concludedAt: '2026-07-17 09:20',
  },
  {
    id: 'test3', tankId: 't10', startDate: '2026-08-20', startTime: '07:30', employeeId: 'u2',
    initialLevel: 36, m24h: { level: 35, date: '2026-08-21', time: '07:35', employeeId: 'u2', observations: '' },
    m48h: { level: 34, date: '2026-08-22', time: '07:30', employeeId: 'u2', observations: '' },
    expected24h: '2026-08-21 07:30', expected48h: '2026-08-22 07:30',
    result: 'APTO', observations: '', stage: 'CONCLUIDO', concludedAt: '2026-08-22 07:45',
  },
  {
    id: 'test4', tankId: 't13', startDate: '2026-09-01', startTime: '08:00', employeeId: 'u3',
    initialLevel: 35, m24h: { level: 34, date: '2026-09-02', time: '08:10', employeeId: 'u3', observations: '' },
    m48h: { level: 33, date: '2026-09-03', time: '07:50', employeeId: 'u3', observations: '' },
    expected24h: '2026-09-02 08:00', expected48h: '2026-09-03 08:00',
    result: 'APTO', observations: 'Excelente conservação', stage: 'CONCLUIDO', concludedAt: '2026-09-03 08:05',
  },
  // Active tests
  {
    id: 'test5', tankId: 't2', startDate: '2026-09-19', startTime: '14:00', employeeId: 'u2',
    initialLevel: 35, m24h: null, m48h: null,
    expected24h: '2026-09-20 14:00', expected48h: '2026-09-21 14:00',
    result: 'PENDENTE', observations: 'Primeiro teste', stage: 'INICIADO', concludedAt: null,
  },
  {
    id: 'test6', tankId: 't11', startDate: '2026-09-18', startTime: '10:00', employeeId: 'u3',
    initialLevel: 33, m24h: { level: 31, date: '2026-09-19', time: '10:05', employeeId: 'u3', observations: '' },
    m48h: null,
    expected24h: '2026-09-19 10:00', expected48h: '2026-09-20 10:00',
    result: 'PENDENTE', observations: 'Segundo teste após retorno', stage: 'M24H', concludedAt: null,
  },
  // Overdue test (started 5 days ago, no 24h measurement)
  {
    id: 'test7', tankId: 't4', startDate: '2026-09-15', startTime: '08:00', employeeId: 'u2',
    initialLevel: 34, m24h: null, m48h: null,
    expected24h: '2026-09-16 08:00', expected48h: '2026-09-17 08:00',
    result: 'PENDENTE', observations: '', stage: 'INICIADO', concludedAt: null,
  },
];

const movements: Movement[] = [
  {
    id: 'mv1', tankId: 't5', representativeId: 'r1', regional: 'Centro-Oeste', uf: 'GO',
    carrierId: 'c1', exitDate: '2026-09-18', invoice: 'NF-001234', orderNumber: 'PED-7801',
    orderCount: 3, doseCount: 450, deadline: '2026-09-25', deliveryForecast: '2026-09-22',
    deliveryDate: null, collectionRequested: false, collectionDate: null,
    returnDate: null, receivedBy: null, returnCondition: '', observations: 'Carga prioritária',
    status: 'EM_TRANSPORTE',
  },
  {
    id: 'mv2', tankId: 't6', representativeId: 'r2', regional: 'Sudeste', uf: 'MG',
    carrierId: 'c2', exitDate: '2026-09-10', invoice: 'NF-001200', orderNumber: 'PED-7750',
    orderCount: 2, doseCount: 300, deadline: '2026-09-20', deliveryForecast: '2026-09-14',
    deliveryDate: '2026-09-14', collectionRequested: false, collectionDate: null,
    returnDate: null, receivedBy: null, returnCondition: '', observations: '',
    status: 'ENTREGUE',
  },
  {
    id: 'mv3', tankId: 't7', representativeId: 'r3', regional: 'Norte', uf: 'PA',
    carrierId: 'c3', exitDate: '2026-09-05', invoice: 'NF-001150', orderNumber: 'PED-7700',
    orderCount: 5, doseCount: 750, deadline: '2026-09-15', deliveryForecast: '2026-09-09',
    deliveryDate: '2026-09-09', collectionRequested: true, collectionDate: '2026-09-17',
    returnDate: null, receivedBy: null, returnCondition: '', observations: 'Cliente solicitou coleta',
    status: 'AGUARDANDO_COLETA',
  },
  {
    id: 'mv4', tankId: 't8', representativeId: 'r4', regional: 'Sul', uf: 'PR',
    carrierId: 'c1', exitDate: '2026-08-20', invoice: 'NF-001080', orderNumber: 'PED-7650',
    orderCount: 1, doseCount: 150, deadline: '2026-09-01', deliveryForecast: '2026-08-24',
    deliveryDate: '2026-08-24', collectionRequested: true, collectionDate: '2026-08-28',
    returnDate: '2026-09-01', receivedBy: 'u2', returnCondition: 'Bom estado',
    observations: '', status: 'RETORNADO',
  },
  {
    id: 'mv5', tankId: 't14', representativeId: 'r5', regional: 'Nordeste', uf: 'BA',
    carrierId: 'c2', exitDate: '2026-09-16', invoice: 'NF-001260', orderNumber: 'PED-7820',
    orderCount: 4, doseCount: 600, deadline: '2026-09-26', deliveryForecast: '2026-09-20',
    deliveryDate: '2026-09-20', collectionRequested: true, collectionDate: '2026-09-19',
    returnDate: null, receivedBy: null, returnCondition: '', observations: 'Retorno solicitado',
    status: 'RETORNANDO',
  },
  {
    id: 'mv6', tankId: 't9', representativeId: 'r1', regional: 'Centro-Oeste', uf: 'GO',
    carrierId: 'c1', exitDate: '2026-08-15', invoice: 'NF-001050', orderNumber: 'PED-7600',
    orderCount: 2, doseCount: 280, deadline: '2026-08-25', deliveryForecast: '2026-08-19',
    deliveryDate: '2026-08-19', collectionRequested: true, collectionDate: '2026-08-22',
    returnDate: '2026-08-26', receivedBy: 'u3', returnCondition: 'Bom estado, sem avarias',
    observations: '', status: 'AGUARDANDO_NOVO_TESTE',
  },
];

const notifications: Notification[] = [
  { id: 'n1', type: 'M24H', message: 'Medição de 24h prevista para hoje — IMOB 451 (14:00)', tankId: 't2', date: '2026-09-20', read: false },
  { id: 'n2', type: 'M48H', message: 'Medição de 48h prevista para hoje — IMOB 460 (10:00)', tankId: 't11', date: '2026-09-20', read: false },
  { id: 'n3', type: 'TESTE_ATRASADO', message: 'Teste atrasado — IMOB 453 sem medição de 24h', tankId: 't4', date: '2026-09-20', read: false },
  { id: 'n4', type: 'AGUARDANDO_COLETA', message: 'IMOB 456 aguardando coleta há 3 dias', tankId: 't7', date: '2026-09-20', read: false },
  { id: 'n5', type: 'RETORNO_ATRASADO', message: 'Retorno atrasado — IMOB 455 (previsão: 20/09)', tankId: 't6', date: '2026-09-20', read: false },
  { id: 'n6', type: 'NAO_APTO', message: 'IMOB 452 classificado como NÃO APTO', tankId: 't3', date: '2026-07-17', read: true },
];

const audit: AuditEntry[] = [
  { id: 'a1', user: 'Ana Ribeiro', date: '2026-09-19', time: '14:00', action: 'Teste iniciado', entity: 'IMOB 451' },
  { id: 'a2', user: 'Bruno Faria', date: '2026-09-19', time: '10:05', action: 'Medição 24h registrada', entity: 'IMOB 460' },
  { id: 'a3', user: 'Ana Ribeiro', date: '2026-09-15', time: '08:00', action: 'Teste iniciado', entity: 'IMOB 453' },
  { id: 'a4', user: 'Carlos Mendes', date: '2026-09-03', time: '08:05', action: 'IMOB 462 marcado como APTO', entity: 'IMOB 462' },
  { id: 'a5', user: 'Bruno Faria', date: '2026-07-17', time: '09:20', action: 'IMOB 452 marcado como NÃO APTO', entity: 'IMOB 452' },
  { id: 'a6', user: 'Ana Ribeiro', date: '2026-09-18', time: '07:30', action: 'Saída registrada', entity: 'IMOB 454' },
  { id: 'a7', user: 'Bruno Faria', date: '2026-09-01', time: '10:00', action: 'Retorno registrado', entity: 'IMOB 458' },
  { id: 'a8', user: 'Carlos Mendes', date: '2026-09-20', time: '09:00', action: 'Acesso ao dashboard', entity: 'Sistema' },
];

export const seedData: AppState = {
  currentUser: employees[0],
  users: employees,
  tanks,
  models,
  tests,
  representatives,
  carriers,
  movements,
  notifications,
  responsibles,
  audit,
};
