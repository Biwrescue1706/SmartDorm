export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  error?: string;
}