import mongoose, { Document, Schema } from 'mongoose';

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

export interface ProductDocument extends IProduct, Document {
  getProcessStages(): Promise<any[]>;
  isActive(): boolean;
}

const productSchema = new Schema<ProductDocument>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  specifications: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  processStages: [{
    stageId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductionStage',
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Order must be at least 1']
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Stage name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute']
    },
    requiredSkills: [{
      type: String,
      trim: true
    }],
    qualityChecks: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      required: {
        type: Boolean,
        default: true
      }
    }]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total estimated duration
productSchema.virtual('totalEstimatedDuration').get(function() {
  return this.processStages.reduce((total, stage) => total + stage.estimatedDuration, 0);
});

// Virtual for stage count
productSchema.virtual('stageCount').get(function() {
  return this.processStages.length;
});

// Indexes
productSchema.index({ companyId: 1, status: 1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

// Instance method to get process stages
productSchema.methods.getProcessStages = async function(): Promise<any[]> {
  const stageIds = this.processStages.map((stage: any) => stage.stageId);
  return mongoose.model('ProductionStage').find({
    _id: { $in: stageIds },
    companyId: this.companyId
  }).sort({ order: 1 });
};

// Instance method to check if product is active
productSchema.methods.isActive = function(): boolean {
  return this.status === 'active';
};

// Static method to find active products by company
productSchema.statics.findActiveByCompany = function(companyId: string) {
  return this.find({ companyId, status: 'active' }).sort({ name: 1 });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(companyId: string, category: string) {
  return this.find({ companyId, category, status: 'active' }).sort({ name: 1 });
};

// Pre-save middleware to validate process stages
productSchema.pre('save', function(next) {
  if (this.processStages && this.processStages.length > 0) {
    // Validate order sequence
    const orders = this.processStages.map((stage: any) => stage.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      throw new Error('Process stages must have unique order numbers');
    }
    
    // Validate order starts from 1
    const minOrder = Math.min(...orders);
    if (minOrder !== 1) {
      throw new Error('Process stages order must start from 1');
    }
  }
  next();
});

export const Product = mongoose.model<ProductDocument>('Product', productSchema);
