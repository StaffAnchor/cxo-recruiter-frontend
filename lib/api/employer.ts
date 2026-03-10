import apiClient from '../api-client';

// Types
export interface EmployerProfile {
  id: string;
  userId: string;
  fullName: string | null;
  companyName: string;
  location: string | null;
  companySize: string | null;
  gstNumber: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface EmployerStatistics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsByStatus: {
    [key: string]: number;
  };
}

export interface ApprovalStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
}

export interface UpdateEmployerProfileData {
  fullName?: string;
  companyName?: string;
  location?: string;
  companySize?: string;
  gstNumber?: string;
}

// API Functions

/**
 * Get employer profile
 */
export const getEmployerProfile = async (): Promise<EmployerProfile> => {
  const response = await apiClient.get('api/employer/profile');
  return response.data.data;
};

/**
 * Update employer profile
 */
export const updateEmployerProfile = async (
  data: UpdateEmployerProfileData
): Promise<EmployerProfile> => {
  const response = await apiClient.put('api/employer/profile', data);
  return response.data.data;
};

/**
 * Delete employer profile
 */
export const deleteEmployerProfile = async (): Promise<void> => {
  await apiClient.delete('api/employer/profile');
};

/**
 * Get employer statistics
 */
export const getEmployerStatistics = async (): Promise<EmployerStatistics> => {
  const response = await apiClient.get('api/employer/statistics');
  return response.data.data;
};

/**
 * Get employer approval status
 */
export const getEmployerApprovalStatus = async (): Promise<ApprovalStatus> => {
  const response = await apiClient.get('api/employer/approval-status');
  return response.data.data;
};

const employerApi = {
  getEmployerProfile,
  updateEmployerProfile,
  deleteEmployerProfile,
  getEmployerStatistics,
  getEmployerApprovalStatus,
};

export default employerApi;
