import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    ApiResponse,
    PaginatedResponse,
    User,
    TestCase,
    LoginCredentials,
    RegisterData,
    TestCaseFilters
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('qaest_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('qaest_token');
          localStorage.removeItem('qaest_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
      await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
      await this.api.post('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await this.api.put('/auth/profile', data);
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.put('/auth/change-password', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/auth/logout');
    return response.data;
  }

  // Test Case endpoints
  async getTestCases(filters?: TestCaseFilters): Promise<PaginatedResponse<TestCase>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<PaginatedResponse<TestCase>> = 
      await this.api.get(`/test-cases?${params.toString()}`);
    return response.data;
  }

  async getTestCase(id: string): Promise<ApiResponse<{ testCase: TestCase }>> {
    const response: AxiosResponse<ApiResponse<{ testCase: TestCase }>> = 
      await this.api.get(`/test-cases/${id}`);
    return response.data;
  }

  async createTestCase(data: Partial<TestCase>): Promise<ApiResponse<{ testCase: TestCase }>> {
    const response: AxiosResponse<ApiResponse<{ testCase: TestCase }>> = 
      await this.api.post('/test-cases', data);
    return response.data;
  }

  async updateTestCase(id: string, data: Partial<TestCase>): Promise<ApiResponse<{ testCase: TestCase }>> {
    const response: AxiosResponse<ApiResponse<{ testCase: TestCase }>> = 
      await this.api.put(`/test-cases/${id}`, data);
    return response.data;
  }

  async deleteTestCase(id: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.delete(`/test-cases/${id}`);
    return response.data;
  }

  async duplicateTestCase(id: string): Promise<ApiResponse<{ testCase: TestCase }>> {
    const response: AxiosResponse<ApiResponse<{ testCase: TestCase }>> = 
      await this.api.post(`/test-cases/${id}/duplicate`);
    return response.data;
  }

  async getMyTestCases(filters?: TestCaseFilters): Promise<PaginatedResponse<TestCase>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<PaginatedResponse<TestCase>> = 
      await this.api.get(`/test-cases/my?${params.toString()}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 