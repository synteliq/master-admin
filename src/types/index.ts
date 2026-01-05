export type UserRole = 'admin' | 'tenant';

export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  createdAt: string; // ISO date
  apiKey: string; // In a real app, this might be hashed or not returned in list
  settings?: {
    brandColor?: string;
    font?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  apiKey?: string;
  teamKey?: string;
  createdAt: string;
  styles?: string;
}

export interface TenantFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
  content?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  user: {
    id: string; // 'admin' or tenantId
    name: string;
  } | null;
  token?: string; // Mock token
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
