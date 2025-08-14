import mongoose, { Document, Schema } from 'mongoose';
import { IProductionStage, ProductionStageStatus } from '../types';

export interface ProductionStageDocument extends IProductionStage, Document {
  canUserAccess(userId: string, role: string): boolean;
  updateProgress(completedQuantity: number): Promise<void>;
  getNextStages(): Promise<ProductionStageDocument[]>;
}

const productionStageSchema = new Schema<ProductionStageDocument>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true,
    maxlength: [100, 'Stage name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  order: {
    type: Number,
    required: true,
    min: [1, 'Order must be at least 1']
  },
  status: {
    type: String,
    enum: Object.values(ProductionStageStatus),
    default: ProductionStageStatus.PLANNED,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  actualDuration: {
    type: Number,
    min: [0, 'Actual duration cannot be negative']
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  inputMaterials: [{
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: true,
      trim: true
    }
  }],
  outputMaterials: [{
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: true,
      trim: true
    }
  }],
  qualityChecks: [{
    checkId: {
      type: Schema.Types.ObjectId,
      ref: 'QualityCheck'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    required: {
      type: Boolean,
      default: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // DAG structure
  predecessors: [{
    type: Schema.Types.ObjectId,
    ref: 'ProductionStage'
  }],
  successors: [{
    type: Schema.Types.ObjectId,
    ref: 'ProductionStage'
  }],
  // Progress tracking
  targetQuantity: {
    type: Number,
    required: true,
    min: [1, 'Target quantity must be at least 1']
  },
  completedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Completed quantity cannot be negative']
  },
  wipQuantity: {
    type: Number,
    default: 0,
    min: [0, 'WIP quantity cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
productionStageSchema.virtual('progressPercentage').get(function() {
  return this.targetQuantity > 0 ? (this.completedQuantity / this.targetQuantity) * 100 : 0;
});

// Virtual for remaining quantity
productionStageSchema.virtual('remainingQuantity').get(function() {
  return Math.max(0, this.targetQuantity - this.completedQuantity);
});

// Indexes
productionStageSchema.index({ companyId: 1, order: 1 });
productionStageSchema.index({ status: 1 });
productionStageSchema.index({ assignedTo: 1 });
productionStageSchema.index({ supervisor: 1 });
productionStageSchema.index({ startDate: 1, endDate: 1 });

// Instance method to check user access
productionStageSchema.methods.canUserAccess = function(userId: string, role: string): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  if (role === 'supervisor' && this.supervisor?.toString() === userId) return true;
  if (role === 'employee' && this.assignedTo.some((id: any) => id.toString() === userId)) return true;
  return false;
};

// Instance method to update progress
productionStageSchema.methods.updateProgress = async function(completedQuantity: number): Promise<void> {
  this.completedQuantity = Math.min(completedQuantity, this.targetQuantity);
  this.wipQuantity = Math.max(0, this.targetQuantity - this.completedQuantity);
  
  if (this.completedQuantity >= this.targetQuantity) {
    this.status = ProductionStageStatus.COMPLETED;
    this.endDate = new Date();
  } else if (this.completedQuantity > 0) {
    this.status = ProductionStageStatus.IN_PROGRESS;
    if (!this.startDate) {
      this.startDate = new Date();
    }
  }
  
  await this.save();
};

// Instance method to get next stages
productionStageSchema.methods.getNextStages = async function(): Promise<ProductionStageDocument[]> {
  return this.model('ProductionStage').find({
    _id: { $in: this.successors },
    companyId: this.companyId
  });
};

// Static method to find stages by company
productionStageSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId }).sort({ order: 1 });
};

// Static method to find active stages
productionStageSchema.statics.findActiveStages = function(companyId: string) {
  return this.find({
    companyId,
    status: { $in: [ProductionStageStatus.IN_PROGRESS, ProductionStageStatus.PLANNED] }
  }).sort({ order: 1 });
};

// Pre-save middleware to validate DAG structure
productionStageSchema.pre('save', async function(next) {
  if (this.isModified('successors') || this.isModified('predecessors')) {
    // Validate no circular dependencies
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = async (stageId: string): Promise<boolean> => {
      if (recursionStack.has(stageId)) return true;
      if (visited.has(stageId)) return false;
      
      visited.add(stageId);
      recursionStack.add(stageId);
      
      const stage = await this.model('ProductionStage').findById(stageId);
      if (stage) {
        for (const successorId of stage.successors) {
          if (await hasCycle(successorId.toString())) {
            return true;
          }
        }
      }
      
      recursionStack.delete(stageId);
      return false;
    };
    
    if (await hasCycle(this._id.toString())) {
      throw new Error('Circular dependency detected in production stages');
    }
  }
  next();
});

export const ProductionStage = mongoose.model<ProductionStageDocument>('ProductionStage', productionStageSchema);