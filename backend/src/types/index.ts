import { Request } from 'express';

// User Roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee'
}

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// Company Status
export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

// Production Stage Status
export enum ProductionStageStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

// Inventory Status
export enum InventoryStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved'
}

// Quality Status
export enum QualityStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review'
}

// Maintenance Status
export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

// User Interface
export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  companyId: string;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
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

// Company Interface
export interface ICompany {
  _id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
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

// Production Stage Interface
export interface IProductionStage {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  order: number;
  status: ProductionStageStatus;
  estimatedDuration: number; // in minutes
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
  // DAG structure
  predecessors: string[];
  successors: string[];
  // Progress tracking
  targetQuantity: number;
  completedQuantity: number;
  wipQuantity: number;
}

// Product Interface
export interface IProduct {
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

// Task Interface
export interface ITask {
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

// Inventory Item Interface
export interface IInventoryItem {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: InventoryStatus;
  location: string;
  supplier?: {
    name: string;
    contact: string;
    leadTime: number; // in days
  };
  cost: {
    unitCost: number;
    currency: string;
  };
  specifications?: Record<string, any>;
  expiryDate?: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Quality Check Interface
export interface IQualityCheck {
  _id: string;
  companyId: string;
  productionStageId: string;
  name: string;
  description?: string;
  type: 'visual' | 'measurement' | 'test' | 'documentation';
  criteria: Array<{
    parameter: string;
    minValue?: number;
    maxValue?: number;
    targetValue?: number;
    unit?: string;
  }>;
  status: QualityStatus;
  inspector: string;
  results?: Array<{
    parameter: string;
    value: number;
    unit: string;
    passed: boolean;
    notes?: string;
  }>;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Maintenance Task Interface
export interface IMaintenanceTask {
  _id: string;
  companyId: string;
  title: string;
  description?: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: MaintenanceStatus;
  equipment: string;
  assignedTo?: string[];
  scheduledDate: Date;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  startDate?: Date;
  endDate?: Date;
  checklist: Array<{
    item: string;
    completed: boolean;
    notes?: string;
  }>;
  parts: Array<{
    partId: string;
    quantity: number;
    cost: number;
  }>;
  cost: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Report Interface
export interface IReport {
  _id: string;
  companyId: string;
  name: string;
  type: 'production' | 'inventory' | 'quality' | 'maintenance' | 'performance';
  parameters: Record<string, any>;
  generatedBy: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Interface
export interface IAuditLog {
  _id: string;
  companyId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Extended Request Interface
export interface AuthRequest extends Request {
  user?: IUser;
  company?: any; // Using any for now to avoid interface conflicts with Mongoose methods
}

// API Response Interfaces
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

// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  companyId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

// Database Query Interfaces
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  filter?: Record<string, any>;
  select?: string;
  populate?: string | string[];
}

// Email Template Interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Notification Interface
export interface INotification {
  _id: string;
  companyId: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}