import api from './api';
import type { Product, Task } from '../types';

// Product API calls
export const productService = {
  // Get all products
  getProducts: async (params?: Record<string, string | number>) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  createProduct: async (productData: Partial<Product>) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get product categories
  getProductCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get product statistics
  getProductStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  }
};

// Task API calls
export const taskService = {
  // Get all tasks
  getTasks: async (params?: Record<string, string | number>) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (taskData: Partial<Task>) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task progress
  updateTaskProgress: async (id: string, progressData: { completedQuantity: number; notes?: string }) => {
    const response = await api.put(`/tasks/${id}/progress`, progressData);
    return response.data;
  },

  // Complete quality check
  completeQualityCheck: async (id: string, checkData: { checkName: string; notes?: string }) => {
    const response = await api.put(`/tasks/${id}/quality-check`, checkData);
    return response.data;
  },

  // Update task
  updateTask: async (id: string, taskData: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  }
};

// Work Order API calls (for task creation)
export const workOrderService = {
  // Get all work orders
  getWorkOrders: async (params?: Record<string, string | number>) => {
    const response = await api.get('/production/work-orders', { params });
    return response.data;
  }
};

// User API calls (for task assignment)
export const userService = {
  // Get users by role
  getUsersByRole: async (role: string) => {
    const response = await api.get('/users', { params: { role } });
    return response.data;
  }
};