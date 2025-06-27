// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'qa_lead' | 'senior_qa' | 'junior_qa' | 'project_manager' | 'stakeholder';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  profileData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Test Case types
export interface TestCase {
  id: string;
  testCaseId: string;
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'active' | 'deprecated' | 'archived' | 'passed' | 'failed' | 'blocked' | 'not_executed';
  category?: string;
  module?: string;
  appType: 'web' | 'mobile' | 'desktop' | 'api';
  osType: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'cross_platform';
  environment?: string;
  prerequisites?: string;
  testSteps?: TestStep[];
  expectedResults?: string;
  testData?: string;
  estimatedTime?: number;
  tags?: string[];
  prdLink?: string;
  externalLinks?: ExternalLink[];
  metadata?: Record<string, any>;
  createdBy: string;
  updatedBy?: string;
  epicId?: string;
  isLocked: boolean;
  lockReason?: string;
  version: number;
  creator?: User;
  updater?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface ExternalLink {
  title: string;
  url: string;
  type?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Auth types
export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Filter types
export interface TestCaseFilters {
  status?: string;
  priority?: string;
  category?: string;
  module?: string;
  appType?: string;
  osType?: string;
  createdBy?: string;
  search?: string;
  page?: number;
  limit?: number;
} 