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

export default api;
