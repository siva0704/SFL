import api from './api';

export interface ProductionStageData {
  name: string;
  description?: string;
  order: number;
  estimatedDuration: number;
  targetQuantity: number;
  assignedTo?: string[];
  supervisor?: string;
  inputMaterials?: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
  outputMaterials?: Array<{
    materialId: string;
    quantity: number;
    unit: string;
  }>;
  predecessors?: string[];
  successors?: string[];
  notes?: string;
}

export interface WorkOrderData {
  productName: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetQuantity: number;
  startDate: string;
  dueDate: string;
  stages: Array<{
    stageId: string;
    order: number;
    assignedTo?: string[];
  }>;
  assignedTo?: string[];
  supervisor?: string;
  notes?: string;
}

export interface ProgressUpdateData {
  completedQuantity: number;
  notes?: string;
}

export interface ProductionFilters {
  page?: number;
  limit?: number;
  status?: string;
  assignedTo?: string;
  priority?: string;
}

class ProductionService {
  // Dashboard
  async getDashboardData() {
    return api.get('/production/dashboard');
  }

  // Production Stages
  async getProductionStages(filters: ProductionFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`/production/stages?${params.toString()}`);
  }

  async getProductionStageById(id: string) {
    return api.get(`/production/stages/${id}`);
  }

  async createProductionStage(data: ProductionStageData) {
    return api.post('/production/stages', data);
  }

  async updateProductionStage(id: string, data: Partial<ProductionStageData>) {
    return api.put(`/production/stages/${id}`, data);
  }

  async updateStageProgress(id: string, data: ProgressUpdateData) {
    return api.put(`/production/stages/${id}/progress`, data);
  }

  async deleteProductionStage(id: string) {
    return api.delete(`/production/stages/${id}`);
  }

  // Work Orders
  async getWorkOrders(filters: ProductionFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return api.get(`/production/work-orders?${params.toString()}`);
  }

  async getWorkOrderById(id: string) {
    return api.get(`/production/work-orders/${id}`);
  }

  async createWorkOrder(data: WorkOrderData) {
    return api.post('/production/work-orders', data);
  }

  async updateWorkOrder(id: string, data: Partial<WorkOrderData>) {
    return api.put(`/production/work-orders/${id}`, data);
  }

  async deleteWorkOrder(id: string) {
    return api.delete(`/production/work-orders/${id}`);
  }

  // Analytics
  async getProductionAnalytics(dateRange?: { startDate: string; endDate: string }) {
    const params = dateRange ? new URLSearchParams(dateRange) : '';
    return api.get(`/production/analytics?${params.toString()}`);
  }

  async getStagePerformance(stageId: string, dateRange?: { startDate: string; endDate: string }) {
    const params = dateRange ? new URLSearchParams(dateRange) : '';
    return api.get(`/production/stages/${stageId}/performance?${params.toString()}`);
  }

  // Real-time updates
  async getStageUpdates(stageId: string) {
    return api.get(`/production/stages/${stageId}/updates`);
  }

  // Bulk operations
  async bulkUpdateStages(updates: Array<{ id: string; data: Partial<ProductionStageData> }>) {
    return api.put('/production/stages/bulk', { updates });
  }

  async bulkUpdateProgress(updates: Array<{ id: string; completedQuantity: number; notes?: string }>) {
    return api.put('/production/stages/bulk-progress', { updates });
  }

  // Export/Import
  async exportStages(format: 'csv' | 'excel' = 'csv') {
    return api.get(`/production/stages/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  async importStages(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/production/stages/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export const productionService = new ProductionService();