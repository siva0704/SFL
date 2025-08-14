import { Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { ProductionStage } from '../models/ProductionStage';
import { WorkOrder } from '../models/WorkOrder';
import { User } from '../models/User';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, UserRole, ProductionStageStatus } from '../types';
import { logInfo, logAudit } from '../utils/logger';
import mongoose from 'mongoose';

// Get all production stages
export const getProductionStages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, status, assignedTo } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = { companyId: req.user.companyId };
  
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Role-based filtering
  if (req.user.role === UserRole.EMPLOYEE) {
    filter.assignedTo = req.user._id;
  } else if (req.user.role === UserRole.SUPERVISOR) {
    filter.$or = [
      { supervisor: req.user._id },
      { assignedTo: req.user._id }
    ];
  }

  const stages = await ProductionStage.find(filter)
    .populate('assignedTo', 'firstName lastName email')
    .populate('supervisor', 'firstName lastName email')
    .populate('inputMaterials.materialId', 'name sku unit')
    .populate('outputMaterials.materialId', 'name sku unit')
    .sort({ order: 1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await ProductionStage.countDocuments(filter);

  res.json({
    success: true,
    data: {
      stages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + stages.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Get production stage by ID
export const getProductionStageById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid stage ID', 400));
  }

  const stage = await ProductionStage.findById(id)
    .populate('assignedTo', 'firstName lastName email role')
    .populate('supervisor', 'firstName lastName email')
    .populate('inputMaterials.materialId', 'name sku unit currentStock')
    .populate('outputMaterials.materialId', 'name sku unit currentStock')
    .populate('predecessors', 'name status completedQuantity')
    .populate('successors', 'name status completedQuantity');

  if (!stage) {
    return next(new AppError('Production stage not found', 404));
  }

  if (stage.companyId.toString() !== req.user.companyId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  if (!stage.canUserAccess(req.user._id.toString(), req.user.role)) {
    return next(new AppError('Access denied to this stage', 403));
  }

  res.json({
    success: true,
    data: { stage }
  });
});

// Create production stage
export const createProductionStage = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),
  body('targetQuantity').isInt({ min: 1 }).withMessage('Target quantity must be at least 1'),
  body('assignedTo').optional().isArray().withMessage('Assigned users must be an array'),
  body('supervisor').optional().isMongoId().withMessage('Invalid supervisor ID'),
  body('inputMaterials').optional().isArray().withMessage('Input materials must be an array'),
  body('outputMaterials').optional().isArray().withMessage('Output materials must be an array'),
  body('predecessors').optional().isArray().withMessage('Predecessors must be an array'),
  body('successors').optional().isArray().withMessage('Successors must be an array'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    // Only admins and supervisors can create stages
    if (![UserRole.ADMIN, UserRole.SUPERVISOR].includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    const stageData = {
      ...req.body,
      companyId: req.user.companyId
    };

    const stage = new ProductionStage(stageData);
    await stage.save();

    logAudit(req.user._id.toString(), 'create', 'production_stage', {
      stageId: stage._id,
      stageName: stage.name
    });

    const populatedStage = await ProductionStage.findById(stage._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Production stage created successfully',
      data: { stage: populatedStage }
    });
  })
];

// Update production stage
export const updateProductionStage = [
  param('id').isMongoId().withMessage('Invalid stage ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),
  body('targetQuantity').optional().isInt({ min: 1 }).withMessage('Target quantity must be at least 1'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    const { id } = req.params;
    const stage = await ProductionStage.findById(id);

    if (!stage) {
      return next(new AppError('Production stage not found', 404));
    }

    if (stage.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Role-based access control
    if (req.user.role === UserRole.EMPLOYEE) {
      return next(new AppError('Employees cannot update stages', 403));
    }

    if (req.user.role === UserRole.SUPERVISOR && stage.supervisor?.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update stages you supervise', 403));
    }

    Object.assign(stage, req.body);
    await stage.save();

    logAudit(req.user._id.toString(), 'update', 'production_stage', {
      stageId: stage._id,
      stageName: stage.name,
      changes: req.body
    });

    const updatedStage = await ProductionStage.findById(stage._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Production stage updated successfully',
      data: { stage: updatedStage }
    });
  })
];

// Update stage progress
export const updateStageProgress = [
  param('id').isMongoId().withMessage('Invalid stage ID'),
  body('completedQuantity').isInt({ min: 0 }).withMessage('Completed quantity must be non-negative'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    const { id } = req.params;
    const { completedQuantity, notes } = req.body;

    const stage = await ProductionStage.findById(id);

    if (!stage) {
      return next(new AppError('Production stage not found', 404));
    }

    if (stage.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    if (!stage.canUserAccess(req.user._id.toString(), req.user.role)) {
      return next(new AppError('Access denied to this stage', 403));
    }

    const previousQuantity = stage.completedQuantity;
    await stage.updateProgress(completedQuantity);

    if (notes) {
      stage.notes = notes;
      await stage.save();
    }

    // If stage is completed, trigger next stages
    if (stage.status === ProductionStageStatus.COMPLETED && previousQuantity < stage.targetQuantity) {
      const nextStages = await stage.getNextStages();
      for (const nextStage of nextStages) {
        if (nextStage.status === ProductionStageStatus.PLANNED) {
          nextStage.status = ProductionStageStatus.IN_PROGRESS;
          await nextStage.save();
        }
      }
    }

    logAudit(req.user._id.toString(), 'update_progress', 'production_stage', {
      stageId: stage._id,
      stageName: stage.name,
      previousQuantity,
      newQuantity: completedQuantity
    });

    res.json({
      success: true,
      message: 'Stage progress updated successfully',
      data: { stage }
    });
  })
];

// Delete production stage
export const deleteProductionStage = [
  param('id').isMongoId().withMessage('Invalid stage ID'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    // Only admins can delete stages
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Only admins can delete production stages', 403));
    }

    const { id } = req.params;
    const stage = await ProductionStage.findById(id);

    if (!stage) {
      return next(new AppError('Production stage not found', 404));
    }

    if (stage.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Check if stage is in use
    if (stage.status === ProductionStageStatus.IN_PROGRESS) {
      return next(new AppError('Cannot delete stage that is in progress', 400));
    }

    await ProductionStage.findByIdAndDelete(id);

    logAudit(req.user._id.toString(), 'delete', 'production_stage', {
      stageId: stage._id,
      stageName: stage.name
    });

    res.json({
      success: true,
      message: 'Production stage deleted successfully'
    });
  })
];

// Get work orders
export const getWorkOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, status, priority, assignedTo } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = { companyId: req.user.companyId };
  
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Role-based filtering
  if (req.user.role === UserRole.EMPLOYEE) {
    filter.assignedTo = req.user._id;
  } else if (req.user.role === UserRole.SUPERVISOR) {
    filter.$or = [
      { supervisor: req.user._id },
      { assignedTo: req.user._id }
    ];
  }

  const workOrders = await WorkOrder.find(filter)
    .populate('assignedTo', 'firstName lastName email')
    .populate('supervisor', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('stages.stageId', 'name description')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await WorkOrder.countDocuments(filter);

  res.json({
    success: true,
    data: {
      workOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + workOrders.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Create work order
export const createWorkOrder = [
  body('productName').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetQuantity').isInt({ min: 1 }).withMessage('Target quantity must be at least 1'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('dueDate').isISO8601().withMessage('Invalid due date'),
  body('stages').isArray({ min: 1 }).withMessage('At least one stage is required'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    // Only admins and supervisors can create work orders
    if (![UserRole.ADMIN, UserRole.SUPERVISOR].includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    const workOrderData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user._id
    };

    const workOrder = new WorkOrder(workOrderData);
    await workOrder.save();

    logAudit(req.user._id.toString(), 'create', 'work_order', {
      workOrderId: workOrder._id,
      orderNumber: workOrder.orderNumber
    });

    const populatedWorkOrder = await WorkOrder.findById(workOrder._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email')
      .populate('stages.stageId', 'name description');

    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: { workOrder: populatedWorkOrder }
    });
  })
];

// Get production dashboard data
export const getProductionDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const companyId = req.user.companyId;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Base filters for role-based access
  let stageFilter: any = { companyId };
  let workOrderFilter: any = { companyId };

  if (userRole === UserRole.EMPLOYEE) {
    stageFilter.assignedTo = userId;
    workOrderFilter.assignedTo = userId;
  } else if (userRole === UserRole.SUPERVISOR) {
    stageFilter.$or = [{ supervisor: userId }, { assignedTo: userId }];
    workOrderFilter.$or = [{ supervisor: userId }, { assignedTo: userId }];
  }

  // Get stage statistics
  const stageStats = await ProductionStage.aggregate([
    { $match: stageFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTarget: { $sum: '$targetQuantity' },
        totalCompleted: { $sum: '$completedQuantity' }
      }
    }
  ]);

  // Get work order statistics
  const workOrderStats = await WorkOrder.aggregate([
    { $match: workOrderFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTarget: { $sum: '$targetQuantity' },
        totalCompleted: { $sum: '$completedQuantity' }
      }
    }
  ]);

  // Get active stages
  const activeStages = await ProductionStage.find({
    ...stageFilter,
    status: ProductionStageStatus.IN_PROGRESS
  })
    .populate('assignedTo', 'firstName lastName')
    .populate('supervisor', 'firstName lastName')
    .sort({ order: 1 })
    .limit(10);

  // Get recent work orders
  const recentWorkOrders = await WorkOrder.find(workOrderFilter)
    .populate('assignedTo', 'firstName lastName')
    .populate('supervisor', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  // Calculate overall efficiency
  const totalStages = await ProductionStage.countDocuments(stageFilter);
  const completedStages = await ProductionStage.countDocuments({
    ...stageFilter,
    status: ProductionStageStatus.COMPLETED
  });
  const efficiency = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  res.json({
    success: true,
    data: {
      stageStats,
      workOrderStats,
      activeStages,
      recentWorkOrders,
      efficiency: Math.round(efficiency * 100) / 100,
      summary: {
        totalStages,
        completedStages,
        inProgressStages: await ProductionStage.countDocuments({
          ...stageFilter,
          status: ProductionStageStatus.IN_PROGRESS
        }),
        totalWorkOrders: await WorkOrder.countDocuments(workOrderFilter),
        activeWorkOrders: await WorkOrder.countDocuments({
          ...workOrderFilter,
          status: 'active'
        })
      }
    }
  });
});