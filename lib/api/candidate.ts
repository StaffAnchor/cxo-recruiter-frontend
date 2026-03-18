import apiClient from '../api-client';

// Types
export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string | null;
  dob: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | null;
  phone: string | null;
  linkedin: string | null;
  photoUrl: string | null;
  preferredLocations: string[];
  currentCity: string | null;
  totalExperience: number | null;
  currentCTC: number | null;
  currentAnnualFixedCTC: number | null;
  expectedCTC: number | null;
  resumeUrl: string | null;
  skills: CandidateSkill[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  followedKeywords: CandidateKeyword[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateSkill {
  id: string;
  skillId?: string;
  name?: string;
  skillName: string;
  createdAt?: string;
}

export interface CandidateEducation {
  id: string;
  candidateId: string;
  instituteName: string | null;
  // Structured FK fields
  degreeId: string | null;
  specializationId: string | null;
  instituteId: string | null;
  // Expanded relations
  degreeRef: { id: string; name: string } | null;
  specializationRef: { id: string; name: string } | null;
  institute: { id: string; name: string; type: string } | null;
  graduationYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateExperience {
  id: string;
  candidateId: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  currentlyWorking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateKeyword {
  id: string;
  candidateId: string;
  keyword: string;
  createdAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  phone?: string;
  linkedin?: string;
  preferredLocations?: string[];
  currentCity?: string;
  totalExperience?: number;
  currentCTC?: number;
  currentAnnualFixedCTC?: number;
  expectedCTC?: number;
}

export interface AddSkillData {
  skillIds: string[];
}

export interface UpdateSkillsData {
  skillIds: string[];
}

export interface AddEducationData {
  degreeId: string;
  specializationId?: string;
  instituteId?: string;
  customInstituteName?: string;
  graduationYear: number;
}

export interface UpdateEducationData {
  degreeId?: string;
  specializationId?: string | null;
  instituteId?: string;
  customInstituteName?: string | null;
  graduationYear?: number;
}

export interface AddExperienceData {
  companyName: string;
  role: string;
  startDate: string;
  endDate?: string;
  currentlyWorking?: boolean;
}

export interface UpdateExperienceData {
  companyName?: string;
  role?: string;
  startDate?: string;
  endDate?: string | null;
  currentlyWorking?: boolean;
}

export interface AddKeywordData {
  keyword: string;
}

// API Functions

// Profile Management
export const getProfile = async (): Promise<CandidateProfile> => {
  const response = await apiClient.get('/api/candidate/profile');
  return response.data.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<CandidateProfile> => {
  const response = await apiClient.put('/api/candidate/profile', data);
  return response.data.data;
};

// File Uploads
export const uploadPhoto = async (file: File): Promise<{ photoUrl: string }> => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await apiClient.post('/api/candidate/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

export const uploadResume = async (file: File): Promise<{ resumeUrl: string }> => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await apiClient.post('/api/candidate/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Skills Management
export const addSkill = async (data: AddSkillData): Promise<CandidateSkill> => {
  const response = await apiClient.post('/api/candidate/skills', data);
  const skills = response.data.data as CandidateSkill[];
  return skills[0];
};

export const addSkills = async (data: AddSkillData): Promise<CandidateSkill[]> => {
  const response = await apiClient.post('/api/candidate/skills', data);
  return response.data.data;
};

export const updateSkills = async (data: UpdateSkillsData): Promise<CandidateSkill[]> => {
  const response = await apiClient.put('/api/candidate/skills', data);
  return response.data.data;
};

export const removeSkill = async (skillId: string): Promise<void> => {
  await apiClient.delete(`/api/candidate/skills/${skillId}`);
};

export const getSkills = async (): Promise<CandidateSkill[]> => {
  const response = await apiClient.get('/api/candidate/skills');
  return response.data.data;
};

// Education Management
export const addEducation = async (data: AddEducationData): Promise<CandidateEducation> => {
  const response = await apiClient.post('/api/candidate/education', data);
  return response.data.data;
};

export const updateEducation = async (
  educationId: string,
  data: UpdateEducationData
): Promise<CandidateEducation> => {
  const response = await apiClient.put(`/api/candidate/education/${educationId}`, data);
  return response.data.data;
};

export const deleteEducation = async (educationId: string): Promise<void> => {
  await apiClient.delete(`/api/candidate/education/${educationId}`);
};

// Experience Management
export const addExperience = async (data: AddExperienceData): Promise<CandidateExperience> => {
  const response = await apiClient.post('/api/candidate/experience', data);
  return response.data.data;
};

export const updateExperience = async (
  experienceId: string,
  data: UpdateExperienceData
): Promise<CandidateExperience> => {
  const response = await apiClient.put(`/api/candidate/experience/${experienceId}`, data);
  return response.data.data;
};

export const deleteExperience = async (experienceId: string): Promise<void> => {
  await apiClient.delete(`/api/candidate/experience/${experienceId}`);
};

// Keywords Management
export const addKeyword = async (data: AddKeywordData): Promise<CandidateKeyword> => {
  const response = await apiClient.post('/api/candidate/keywords', data);
  return response.data.data;
};

export const removeKeyword = async (keywordId: string): Promise<void> => {
  await apiClient.delete(`/api/candidate/keywords/${keywordId}`);
};

export const getKeywords = async (): Promise<CandidateKeyword[]> => {
  const response = await apiClient.get('/api/candidate/keywords');
  return response.data.data;
};
