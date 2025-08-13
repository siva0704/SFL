import mongoose, { Document, Schema } from 'mongoose';
import { ICompany, CompanyStatus } from '../types';

export interface CompanyDocument extends ICompany, Document {
  generateSlug(): string;
  isSubscriptionActive(): boolean;
  hasModuleAccess(module: string): boolean;
  hasFeatureAccess(feature: string): boolean;
}

const companySchema = new Schema<CompanyDocument>({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(CompanyStatus),
    default: CompanyStatus.PENDING,
    required: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters']
    }
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    }
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC',
      required: true
    },
    currency: {
      type: String,
      default: 'USD',
      required: true,
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
      required: true
    },
    modules: {
      admin: {
        type: Boolean,
        default: true
      },
      supervisor: {
        type: Boolean,
        default: true
      },
      employee: {
        type: Boolean,
        default: true
      },
      quality: {
        type: Boolean,
        default: true
      },
      maintenance: {
        type: Boolean,
        default: true
      },
      reports: {
        type: Boolean,
        default: true
      }
    },
    features: {
      multiStageProduction: {
        type: Boolean,
        default: true
      },
      realTimeTracking: {
        type: Boolean,
        default: true
      },
      qualityControl: {
        type: Boolean,
        default: true
      },
      maintenanceScheduling: {
        type: Boolean,
        default: true
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      required: true,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      required: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
companySchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for subscription status
companySchema.virtual('isActive').get(function() {
  return this.status === CompanyStatus.ACTIVE && this.subscription.status === 'active';
});

// Indexes
companySchema.index({ slug: 1 }, { unique: true });
companySchema.index({ status: 1 });
companySchema.index({ 'subscription.status': 1 });
companySchema.index({ createdAt: -1 });
companySchema.index({ name: 'text', industry: 'text' });

// Pre-save middleware to generate slug
companySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.generateSlug();
  }
  next();
});

// Pre-save middleware to set subscription end date if not provided
companySchema.pre('save', function(next) {
  if (this.isNew && !this.subscription.endDate) {
    // Set end date to 1 year from start date
    this.subscription.endDate = new Date(this.subscription.startDate);
    this.subscription.endDate.setFullYear(this.subscription.endDate.getFullYear() + 1);
  }
  next();
});

// Instance method to generate slug
companySchema.methods.generateSlug = function(): string {
  const baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
};

// Instance method to check if subscription is active
companySchema.methods.isSubscriptionActive = function(): boolean {
  const now = new Date();
  return this.subscription.status === 'active' && 
         this.subscription.endDate > now;
};

// Instance method to check module access
companySchema.methods.hasModuleAccess = function(module: string): boolean {
  return this.settings.modules[module as keyof typeof this.settings.modules] === true;
};

// Instance method to check feature access
companySchema.methods.hasFeatureAccess = function(feature: string): boolean {
  return this.settings.features[feature as keyof typeof this.settings.features] === true;
};

// Static method to find active companies
companySchema.statics.findActive = function() {
  return this.find({ 
    status: CompanyStatus.ACTIVE,
    'subscription.status': 'active',
    'subscription.endDate': { $gt: new Date() }
  });
};

// Static method to find companies by industry
companySchema.statics.findByIndustry = function(industry: string) {
  return this.find({ 
    industry: { $regex: industry, $options: 'i' },
    status: CompanyStatus.ACTIVE
  });
};

// Static method to find companies with expiring subscriptions
companySchema.statics.findExpiringSoon = function(days: number = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'active',
    'subscription.endDate': { 
      $gte: new Date(),
      $lte: expiryDate
    }
  });
};

// Query middleware to exclude inactive companies by default
companySchema.pre(/^find/, function(next) {
  if (this.options.includeInactive !== true) {
    this.find({ status: { $ne: CompanyStatus.INACTIVE } });
  }
  next();
});

export const Company = mongoose.model<CompanyDocument>('Company', companySchema); 