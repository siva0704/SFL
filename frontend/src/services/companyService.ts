import api from './api';

export interface CompanySettings {
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
}

class CompanyService {
  // Get company information
  async getCompanyInfo() {
    return api.get('/companies/me');
  }

  // Update company settings
  async updateCompanySettings(settings: Partial<CompanySettings>) {
    return api.put('/companies/settings', settings);
  }

  // Get company statistics
  async getCompanyStats() {
    return api.get('/companies/stats');
  }

  // Get company subscription info
  async getSubscriptionInfo() {
    return api.get('/companies/subscription');
  }

  // Update company profile
  async updateCompanyProfile(data: {
    name?: string;
    industry?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    contact?: {
      email: string;
      phone: string;
      website?: string;
    };
  }) {
    return api.put('/companies/profile', data);
  }
}

export const companyService = new CompanyService(); 