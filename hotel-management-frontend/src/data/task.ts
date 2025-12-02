// Mock task data for development/testing

export interface Task {
  id: number;
  name: string;
  taskId: number;
  uploadDate: string;
  completionDate: string;
  reserved: boolean;
  idTask: string;
  fkWorkeridWorker: number | null;
}

export const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Clean up Room 101',
    taskId: 1001,
    uploadDate: '2025-12-01T09:00:00Z',
    completionDate: '2025-12-01T11:30:00Z',
    reserved: true,
    idTask: 'T001',
    fkWorkeridWorker: 3
  },
  {
    id: 2,
    name: 'Welcome VIP Clients',
    taskId: 1002,
    uploadDate: '2025-12-02T14:00:00Z',
    completionDate: '2025-12-02T16:00:00Z',
    reserved: true,
    idTask: 'T002',
    fkWorkeridWorker: 1
  },
  {
    id: 3,
    name: 'Deliver luggages Room 306',
    taskId: 1003,
    uploadDate: '2025-12-02T10:00:00Z',
    completionDate: '2025-12-02T10:30:00Z',
    reserved: false,
    idTask: 'T003',
    fkWorkeridWorker: 4
  },
  {
    id: 4,
    name: 'Clean Up Room 205',
    taskId: 1004,
    uploadDate: '2025-12-02T08:00:00Z',
    completionDate: '2025-12-02T10:00:00Z',
    reserved: true,
    idTask: 'T004',
    fkWorkeridWorker: 3
  },
  {
    id: 5,
    name: 'Maintenance AC',
    taskId: 1005,
    uploadDate: '2025-12-03T09:00:00Z',
    completionDate: '2025-12-03T12:00:00Z',
    reserved: false,
    idTask: 'T005',
    fkWorkeridWorker: 1
  },
  {
    id: 6,
    name: 'Group reservation at the restaurant',
    taskId: 1006,
    uploadDate: '2025-12-03T11:00:00Z',
    completionDate: '2025-12-03T11:30:00Z',
    reserved: true,
    idTask: 'T006',
    fkWorkeridWorker: 2
  },
  {
    id: 7,
    name: 'Check-out room 410',
    taskId: 1007,
    uploadDate: '2025-12-02T12:00:00Z',
    completionDate: '2025-12-02T12:30:00Z',
    reserved: true,
    idTask: 'T007',
    fkWorkeridWorker: 1
  },
  {
    id: 8,
    name: 'Inspect room 106',
    taskId: 1008,
    uploadDate: '2025-12-04T15:00:00Z',
    completionDate: '2025-12-04T17:00:00Z',
    reserved: false,
    idTask: 'T008',
    fkWorkeridWorker: 2
  }
];