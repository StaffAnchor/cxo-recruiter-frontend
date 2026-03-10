import api from "../api-client";

export interface RegisterCandidateData {
  email: string;
  password: string;
}

export interface RegisterEmployerData {
  email: string;
  password: string;
  companyName: string;
  location: string;
  companySize: string;
  gstNumber: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  registerCandidate: async (data: RegisterCandidateData) => {
    const response = await api.post("/api/auth/candidate/register", data);
    return response.data;
  },

  registerEmployer: async (data: RegisterEmployerData) => {
    const response = await api.post("/api/auth/employer/register", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData) => {
    const response = await api.post("/api/auth/verify-email", data);
    return response.data;
  },

  resendOTP: async (data: ResendOTPData) => {
    const response = await api.post("/api/auth/resend-otp", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  adminLogin: async (data: LoginData) => {
    const response = await api.post("/api/auth/admin/login", data);
    return response.data;
  },
};
