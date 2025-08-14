import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkOrder {
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

export interface WorkOrderDocument extends IWorkOrder, Document {
  updateStageProgress(stageId: string, completedQuantity: number): Promise<void>;
  getProgressPercentage(): number;
  canUserAccess(userId: string, role: string): boolean;
}

const workOrderSchema = new Schema<WorkOrderDocument>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  productName: {
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    required: true
  },
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
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  actualEndDate: {
    type: Date
  },
  stages: [{
    stageId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductionStage',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    completedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Completed quantity cannot be negative']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
workOrderSchema.virtual('progressPercentage').get(function() {
  return this.targetQuantity > 0 ? (this.completedQuantity / this.targetQuantity) * 100 : 0;
});

// Indexes
workOrderSchema.index({ companyId: 1, status: 1 });
workOrderSchema.index({ orderNumber: 1 }, { unique: true });
workOrderSchema.index({ priority: 1, dueDate: 1 });
workOrderSchema.index({ assignedTo: 1 });
workOrderSchema.index({ supervisor: 1 });
workOrderSchema.index({ createdAt: -1 });

// Instance method to update stage progress
workOrderSchema.methods.updateStageProgress = async function(stageId: string, completedQuantity: number): Promise<void> {
  const stage = this.stages.find((s: any) => s.stageId.toString() === stageId);
  if (!stage) {
    throw new Error('Stage not found in work order');
  }

  stage.completedQuantity = completedQuantity;
  
  if (completedQuantity > 0 && stage.status === 'pending') {
    stage.status = 'in_progress';
    stage.startDate = new Date();
  }
  
  if (completedQuantity >= this.targetQuantity) {
    stage.status = 'completed';
    stage.endDate = new Date();
  }

  // Update overall work order progress
  const totalCompleted = this.stages.reduce((sum: number, s: any) => sum + s.completedQuantity, 0);
  this.completedQuantity = Math.min(totalCompleted / this.stages.length, this.targetQuantity);

  // Check if all stages are completed
  const allStagesCompleted = this.stages.every((s: any) => s.status === 'completed');
  if (allStagesCompleted) {
    this.status = 'completed';
    this.actualEndDate = new Date();
  } else if (this.completedQuantity > 0 && this.status === 'draft') {
    this.status = 'active';
  }

  await this.save();
};

// Instance method to get progress percentage
workOrderSchema.methods.getProgressPercentage = function(): number {
  return this.targetQuantity > 0 ? (this.completedQuantity / this.targetQuantity) * 100 : 0;
};

// Instance method to check user access
workOrderSchema.methods.canUserAccess = function(userId: string, role: string): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  if (role === 'supervisor' && this.supervisor?.toString() === userId) return true;
  if (role === 'employee' && this.assignedTo.some((id: any) => id.toString() === userId)) return true;
  return false;
};

// Pre-save middleware to generate order number
workOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.model('WorkOrder').countDocuments({ companyId: this.companyId });
    this.orderNumber = `WO-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export const WorkOrder = mongoose.model<WorkOrderDocument>('WorkOrder', workOrderSchema);