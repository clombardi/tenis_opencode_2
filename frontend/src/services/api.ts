import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  documento?: string;
  mano?: 'DIESTRO' | 'ZURDO';
  country?: string;
  birthDate?: string;
}

export interface CreatePlayerDto {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  documento?: string;
  mano?: 'DIESTRO' | 'ZURDO';
  country?: string;
  birthDate?: string;
}

export interface UpdatePlayerDto {
  firstName?: string;
  lastName?: string;
  documento?: string;
  mano?: 'DIESTRO' | 'ZURDO';
  country?: string;
  birthDate?: string;
}

export const playersApi = {
  getAll: (params?: { gender?: string; country?: string }) =>
    api.get<Player[]>('/players', { params }),

  getById: (id: string) =>
    api.get<Player>(`/players/${id}`),

  create: (data: CreatePlayerDto) =>
    api.post<Player>('/players', data),

  update: (id: string, data: UpdatePlayerDto) =>
    api.put<Player>(`/players/${id}`, data),

  delete: (id: string) =>
    api.delete(`/players/${id}`),
};

export interface Tournament {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string; code: string };
  genderCategory: 'MASCULINE' | 'FEMININE' | 'MIXED';
  mode: 'SINGLES' | 'DOUBLES' | 'MIXED_DOBLES';
  drawSize: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'REGISTRATION' | 'ORGANIZING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface CreateTournamentDto {
  name: string;
  categoryId: string;
  genderCategory: 'MASCULINE' | 'FEMININE' | 'MIXED';
  mode: 'SINGLES' | 'DOUBLES' | 'MIXED_DOBLES';
  drawSize: number;
  startDate: string;
  endDate: string;
}

export interface UpdateTournamentDto {
  name?: string;
  categoryId?: string;
  genderCategory?: 'MASCULINE' | 'FEMININE' | 'MIXED';
  mode?: 'SINGLES' | 'DOUBLES' | 'MIXED_DOBLES';
  drawSize?: number;
  startDate?: string;
  endDate?: string;
  status?: 'DRAFT' | 'REGISTRATION' | 'ORGANIZING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export const tournamentsApi = {
  getAll: (params?: { status?: string; genderCategory?: string; mode?: string }) =>
    api.get<Tournament[]>('/tournaments', { params }),

  getById: (id: string) =>
    api.get<Tournament>(`/tournaments/${id}`),

  create: (data: CreateTournamentDto) =>
    api.post<Tournament>('/tournaments', data),

  update: (id: string, data: UpdateTournamentDto) =>
    api.put<Tournament>(`/tournaments/${id}`, data),

  delete: (id: string) =>
    api.delete(`/tournaments/${id}`),

  openRegistration: (id: string) =>
    api.patch(`/tournaments/${id}/open-registration`),

  closeRegistration: (id: string) =>
    api.patch(`/tournaments/${id}/close-registration`),
};

export default api;
