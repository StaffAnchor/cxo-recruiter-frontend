import api from '../api-client';

// Types
export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  locations: string[];
  skills: string[];
  experienceMin: number;
  experienceMax: number;
  companyName: string;
  hideCompanyName: boolean;
  industry: string[];
  category: string;
  functionalArea: string;
  salaryMin: number;
  salaryMax: number;
  hideSalary: boolean;
  graduationYearMin: number;
  graduationYearMax: number;
  courseTypes: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
    photoUrl: string;
    currentCity: string;
    totalExperience: number;
    currentCTC: number;
    expectedCTC: number;
    resumeUrl: string;
    skills: Array<{ skillName: string }>;
    education: Array<{
      degreeRef?: { id: string; name: string } | null;
      specializationRef?: { id: string; name: string } | null;
      institute?: { id: string; name: string; type: string } | null;
      instituteName?: string | null;
      graduationYear: number;
    }>;
    experience: Array<{
      companyName: string;
      role: string;
      startDate: string;
      endDate: string | null;
      currentlyWorking: boolean;
    }>;
  };
}

export type ApplicationStatus = 
  | 'APPLIED' 
  | 'SHORTLISTED' 
  | 'INTERVIEW' 
  | 'OFFERED' 
  | 'REJECTED';

export interface CreateJobData {
  title: string;
  description: string;
  locations: string[];
  skills: string[];
  experienceMin: number;
  experienceMax: number;
  companyName: string;
  hideCompanyName?: boolean;
  industry: string[];
  category: string;
  functionalArea: string;
  salaryMin: number;
  salaryMax: number;
  hideSalary?: boolean;
  graduationYearMin: number;
  graduationYearMax: number;
  courseTypes: string[];
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  locations?: string[];
  skills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  companyName?: string;
  hideCompanyName?: boolean;
  industry?: string[];
  category?: string;
  functionalArea?: string;
  salaryMin?: number;
  salaryMax?: number;
  hideSalary?: boolean;
  graduationYearMin?: number;
  graduationYearMax?: number;
  courseTypes?: string[];
}

export interface BrowseJobsParams {
  page?: number;
  limit?: number;
  category?: string;
  experienceMin?: number;
  experienceMax?: number;
  location?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmployerJobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== EMPLOYER APIs ====================

/**
 * Create a new job posting
 */
export const createJob = async (jobData: CreateJobData): Promise<Job> => {
  const response = await api.post('/api/employer/jobs', jobData);
  return response.data.data;
};

/**
 * Get all jobs posted by the employer
 */
export const getEmployerJobs = async (
  page = 1, 
  limit = 10
): Promise<EmployerJobsResponse> => {
  const response = await api.get('/api/employer/jobs', {
    params: { page, limit }
  });
  return response.data.data;
};

/**
 * Get a specific job by ID (employer's own job)
 */
export const getEmployerJobById = async (jobId: string): Promise<Job> => {
  const response = await api.get(`/api/employer/jobs/${jobId}`);
  return response.data.data;
};

/**
 * Update job details
 */
export const updateJob = async (
  jobId: string, 
  jobData: UpdateJobData
): Promise<Job> => {
  const response = await api.patch(`/api/employer/jobs/${jobId}`, jobData);
  return response.data.data;
};

/**
 * Delete a job posting
 */
export const deleteJob = async (jobId: string): Promise<void> => {
  await api.delete(`/api/employer/jobs/${jobId}`);
};

/**
 * Get all applications for a specific job
 */
export const getJobApplications = async (
  jobId: string
): Promise<JobApplication[]> => {
  const response = await api.get(`/api/employer/jobs/${jobId}/applications`);
  return response.data.data;
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus
): Promise<JobApplication> => {
  const response = await api.patch(`/api/applications/${applicationId}/status`, {
    status
  });
  return response.data.data;
};

// ==================== CANDIDATE APIs ====================

/**
 * Browse all available jobs with filters
 */
export const browseJobs = async (
  params: BrowseJobsParams = {}
): Promise<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get('/api/jobs', { params });
  return response.data.data;
};

/**
 * Get jobs by category
 */
export const getJobsByCategory = async (
  category: string,
  page = 1,
  limit = 10
): Promise<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get(`/api/jobs/category/${encodeURIComponent(category)}`, {
    params: { page, limit }
  });
  return response.data.data;
};

/**
 * Get job details by ID (public view)
 */
export const getJobById = async (jobId: string): Promise<Job> => {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data.data;
};

/**
 * Apply to a job
 */
export const applyToJob = async (jobId: string): Promise<JobApplication> => {
  const response = await api.post(`/api/jobs/${jobId}/apply`);
  return response.data.data;
};

/**
 * Get candidate's own applications
 */
export const getCandidateApplications = async (): Promise<JobApplication[]> => {
  const response = await api.get('/api/candidate/applications');
  return response.data.data;
};

// ==================== ADMIN APIs ====================

/**
 * Get all jobs (admin)
 */
export const getAllJobs = async (
  page = 1,
  limit = 10
): Promise<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get('/api/admin/jobs', {
    params: { page, limit }
  });
  return response.data.data;
};

/**
 * Get all applications (admin)
 */
export const getAllApplications = async (
  page = 1,
  limit = 10
): Promise<{ applications: JobApplication[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const response = await api.get('/api/admin/applications', {
    params: { page, limit }
  });
  return response.data.data;
};

/**
 * Delete any job (admin)
 */
export const adminDeleteJob = async (jobId: string): Promise<void> => {
  await api.delete(`/api/admin/jobs/${jobId}`);
};

// Constants
export const JOB_CATEGORIES = [
  'Banking & Finance',
  'Sales & Marketing',
  'Consulting',
  'HR & IR',
  'IT & Systems',
  'Healthcare'
] as const;

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED'
];
