// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  health: `${API_BASE_URL}/health`,
  testCases: `${API_BASE_URL}/api/test-cases`,
  filters: `${API_BASE_URL}/api/test-cases/filters`,
  pendingUsers: `${API_BASE_URL}/api/users/pending`,
  approveUser: (id: string) => `${API_BASE_URL}/api/users/${id}/approve`,
  rejectUser: (id: string) => `${API_BASE_URL}/api/users/${id}/reject`,
  updateRole: (id: string) => `${API_BASE_URL}/api/users/${id}/role`,
};