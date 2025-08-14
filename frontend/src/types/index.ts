// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'supervisor' | 'employee';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  companyId: string;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
  emailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Company Types
export interface Company {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  industry: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    modules: {
      admin: boolean;
      supervisor: boolean;
      employee: boolean;
      quality: boolean;
      maintenance: boolean;
      reports: boolean;
    };
    features: {
      multiStageProduction: boolean;
      realTimeTracking: boolean;
      qualityControl: boolean;
      maintenanceScheduling: boolean;
    };
  };
  subscription: {
    plan: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'cancelled';
  };
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  specifications: Record<string, any>;
  processStages: Array<{
    stageId: string;
    order: number;
    name: string;
    description?: string;
    estimatedDuration: number;
    requiredSkills: string[];
    qualityChecks: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
  }>;
  status: 'active' | 'inactive' | 'discontinued';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Production Stage Types
export interface ProductionStage {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  order: number;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  estimatedDuration: number;
  actualDuration?: number;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string[];
  supervisor?: string;
  inputMaterials: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
  outputMaterials: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
  qualityChecks: Array<{
    checkId: string;
    name: string;
    required: boolean;
    completed: boolean;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  predecessors: string[];
  successors: string[];
  targetQuantity: number;
  completedQuantity: number;
  wipQuantity: number;
}

// Task Types
export interface Task {
  _id: string;
  companyId: string;
  workOrderId: string;
  productId: string;
  stageId: string;
  taskNumber: string;
  name: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  supervisor: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetQuantity: number;
  completedQuantity: number;
  startDate?: Date;
  dueDate: Date;
  actualEndDate?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  qualityChecks: Array<{
    name: string;
    description: string;
    required: boolean;
    completed: boolean;
    completedBy?: string;
    completedAt?: Date;
    notes?: string;
  }>;
  notes: string;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Work Order Types
export interface WorkOrder {
  _id: string;
  companyId: string;
  orderNumber: string;
  productName: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetQuantity: number;
  completedQuantity: number;
  startDate: Date;
  dueDate: Date;
  actualEndDate?: Date;
  stages: Array<{
    stageId: string;
    order: number;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    startDate?: Date;
    endDate?: Date;
    assignedTo?: string[];
    completedQuantity: number;
    notes?: string;
  }>;
  createdBy: string;
  assignedTo?: string[];
  supervisor?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  message?: string;
  timestamp: string;
  path: string;
  method: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  companyName: string;
  industry: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact?: {
    phone: string;
    website?: string;
  };
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// UI Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
  }>;
}

// Root State
export interface RootState {
  auth: AuthState;
  ui: UIState;
}
