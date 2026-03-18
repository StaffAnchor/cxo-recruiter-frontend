import apiClient from '../api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Specialization {
  id: string;
  name: string;
}

export interface Degree {
  id: string;
  name: string;
  specializations: Specialization[];
}

export type InstituteType = 'IIT' | 'IIM' | 'TIER1' | 'OTHER';

export interface Institute {
  id: string;
  name: string;
  type: InstituteType;
}

export interface Skill {
  id: string;
  name: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getDegrees = async (): Promise<Degree[]> => {
  const response = await apiClient.get('/api/meta/degrees');
  return response.data.data;
};

export const getInstitutes = async (type?: InstituteType): Promise<Institute[]> => {
  const response = await apiClient.get('/api/meta/institutes', {
    params: type ? { type } : undefined,
  });
  return response.data.data;
};

export const getSkills = async (search?: string): Promise<Skill[]> => {
  const response = await apiClient.get('/api/meta/skills', {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return response.data.data;
};
