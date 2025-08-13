import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { companyService } from '../../services/companyService';

export interface Company {
  id: string;
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
    plan: 'basic' | 'professional' | 'enterprise';
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'cancelled';
  };
}

export interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  company: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getCompanyInfo = createAsyncThunk(
  'company/getCompanyInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyService.getCompanyInfo();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to get company info');
    }
  }
);

export const updateCompanySettings = createAsyncThunk(
  'company/updateCompanySettings',
  async (settings: Partial<Company['settings']>, { rejectWithValue }) => {
    try {
      const response = await companyService.updateCompanySettings(settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update company settings');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCompany: (state, action: PayloadAction<Company>) => {
      state.company = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Company Info
    builder
      .addCase(getCompanyInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCompanyInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.company = action.payload.data.company;
      })
      .addCase(getCompanyInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Company Settings
    builder
      .addCase(updateCompanySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.company) {
          state.company.settings = { ...state.company.settings, ...action.payload.data.settings };
        }
      })
      .addCase(updateCompanySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCompany } = companySlice.actions;
export default companySlice.reducer; 