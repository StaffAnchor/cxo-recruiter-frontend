import api from "../api-client";

export interface GetEmployersParams {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  page?: number;
  limit?: number;
}

export interface GetCandidatesParams {
  degreeId?: string;
  specializationId?: string;
  instituteType?: "IIT" | "IIM" | "TIER1" | "OTHER";
  page?: number;
  limit?: number;
}

export const adminApi = {
  getEmployers: async (params?: GetEmployersParams) => {
    const response = await api.get("/api/admin/employers", { params });
    return response.data;
  },

  approveEmployer: async (employerId: string) => {
    const response = await api.patch(`/api/admin/employers/${employerId}/approve`);
    return response.data;
  },

  rejectEmployer: async (employerId: string) => {
    const response = await api.patch(`/api/admin/employers/${employerId}/reject`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/api/admin/stats");
    return response.data;
  },

  getCandidates: async (params?: GetCandidatesParams) => {
    const response = await api.get("/api/admin/candidates", { params });
    return response.data;
  },
};

