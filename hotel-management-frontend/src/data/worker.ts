// Mock worker data for development/testing

export interface Worker {
  id: number;
  name: string;
  surname: string;
  contracts: string;
  jobs: string;
  contactInfo: string;
  idWorker: string;
  fkHotelId: number | null;
}

export const mockWorkers: Worker[] = [
  {
    id: 1,
    name: 'Jane',
    surname: 'Doe',
    contracts: 'Permanent Full Time',
    jobs: 'Receptionist',
    contactInfo: 'jane.doe@hotel.com | +1 (555) 123-4567',
    idWorker: 'W001',
    fkHotelId: 1
  },
  {
    id: 2,
    name: 'Jean',
    surname: 'Martin',
    contracts: 'Permanent Full Time',
    jobs: 'Janitor',
    contactInfo: 'jean.martin@hotel.com | +1 (555) 123-4567',
    idWorker: 'W002',
    fkHotelId: 1
  },
  {
    id: 3,
    name: 'Sophie',
    surname: 'Laurence',
    contracts: '6 month contract',
    jobs: 'Cleaning Staff',
    contactInfo: 'sophie.laurent@hotel.com | +1 (555) 123-4567',
    idWorker: 'W003',
    fkHotelId: 1
  },
  {
    id: 4,
    name: 'Pierre',
    surname: 'Russo',
    contracts: 'Permanent Part Time',
    jobs: 'Porter',
    contactInfo: 'pierre.dubois@hotel.com | +1 (555) 123-4567',
    idWorker: 'W004',
    fkHotelId: 1
  },
  {
    id: 5,
    name: 'Claire',
    surname: 'Smith',
    contracts: 'Permanent Full Time',
    jobs: 'Manager',
    contactInfo: 'claire.petit@hotel.com | +1 (555) 123-4567',
    idWorker: 'W005',
    fkHotelId: 1
  }
];