import mongoose, { Document, Schema } from 'mongoose';

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

export interface TaskDocument extends ITask, Document {
  updateProgress(completedQuantity: number): Promise<void>;
  completeQualityCheck(checkName: string, userId: string, notes?: string): Promise<void>;
  canUserAccess(userId: string, role: string): boolean;
  getProgressPercentage(): number;
}

const taskSchema = new Schema<TaskDocument>({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  workOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  stageId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductionStage',
    required: true,
    index: true
  },
  taskNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'paused', 'cancelled'],
    default: 'pending',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
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
    type: Date
  },
  dueDate: {
    type: Date,
    required: true
  },
  actualEndDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: [1, 'Estimated duration must be at least 1 minute']
  },
  actualDuration: {
    type: Number,
    min: [0, 'Actual duration cannot be negative']
  },
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
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
taskSchema.virtual('progressPercentage').get(function() {
  return this.targetQuantity > 0 ? (this.completedQuantity / this.targetQuantity) * 100 : 0;
});

// Virtual for remaining quantity
taskSchema.virtual('remainingQuantity').get(function() {
  return Math.max(0, this.targetQuantity - this.completedQuantity);
});

// Virtual for is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Indexes
taskSchema.index({ companyId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ supervisor: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ createdAt: -1 });

// Instance method to update progress
taskSchema.methods.updateProgress = async function(completedQuantity: number): Promise<void> {
  this.completedQuantity = Math.min(completedQuantity, this.targetQuantity);
  
  if (this.completedQuantity >= this.targetQuantity) {
    this.status = 'completed';
    this.actualEndDate = new Date();
    if (this.startDate) {
      this.actualDuration = Math.round((this.actualEndDate.getTime() - this.startDate.getTime()) / (1000 * 60));
    }
  } else if (this.completedQuantity > 0 && this.status === 'pending') {
    this.status = 'in_progress';
    this.startDate = new Date();
  }
  
  await this.save();
};

// Instance method to complete quality check
taskSchema.methods.completeQualityCheck = async function(checkName: string, userId: string, notes?: string): Promise<void> {
  const check = this.qualityChecks.find((c: any) => c.name === checkName);
  if (!check) {
    throw new Error('Quality check not found');
  }
  
  check.completed = true;
  check.completedBy = userId;
  check.completedAt = new Date();
  if (notes) {
    check.notes = notes;
  }
  
  await this.save();
};

// Instance method to check user access
taskSchema.methods.canUserAccess = function(userId: string, role: string): boolean {
  if (role === 'super_admin' || role === 'admin') return true;
  if (role === 'supervisor' && this.supervisor?.toString() === userId) return true;
  if (role === 'employee' && this.assignedTo?.toString() === userId) return true;
  return false;
};

// Instance method to get progress percentage
taskSchema.methods.getProgressPercentage = function(): number {
  return this.targetQuantity > 0 ? (this.completedQuantity / this.targetQuantity) * 100 : 0;
};

// Static method to find tasks by company
taskSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId }).sort({ createdAt: -1 });
};

// Static method to find tasks by assigned user
taskSchema.statics.findByAssignedUser = function(companyId: string, userId: string) {
  return this.find({ companyId, assignedTo: userId }).sort({ dueDate: 1 });
};

// Static method to find tasks by supervisor
taskSchema.statics.findBySupervisor = function(companyId: string, supervisorId: string) {
  return this.find({ companyId, supervisor: supervisorId }).sort({ dueDate: 1 });
};

// Pre-save middleware to generate task number
taskSchema.pre('save', async function(next) {
  if (this.isNew && !this.taskNumber) {
    const count = await this.model('Task').countDocuments({ companyId: this.companyId });
    this.taskNumber = `TASK-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export const Task = mongoose.model<TaskDocument>('Task', taskSchema);
