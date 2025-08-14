import { Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { Task } from '../models/Task';
import { WorkOrder } from '../models/WorkOrder';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, UserRole } from '../types';
import { logInfo, logAudit } from '../utils/logger';
import mongoose from 'mongoose';

// Get all tasks (role-based filtering)
export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
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
  // Admins can see all tasks

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'firstName lastName email')
    .populate('assignedBy', 'firstName lastName email')
    .populate('supervisor', 'firstName lastName email')
    .populate('workOrderId', 'orderNumber productName')
    .populate('productId', 'name sku')
    .populate('stageId', 'name description')
    .sort({ dueDate: 1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + tasks.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Get task by ID
export const getTaskById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid task ID', 400));
  }

  const task = await Task.findById(id)
    .populate('assignedTo', 'firstName lastName email role')
    .populate('assignedBy', 'firstName lastName email')
    .populate('supervisor', 'firstName lastName email')
    .populate('workOrderId', 'orderNumber productName targetQuantity completedQuantity')
    .populate('productId', 'name sku category')
    .populate('stageId', 'name description estimatedDuration');

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.companyId.toString() !== req.user.companyId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  if (!task.canUserAccess(req.user._id.toString(), req.user.role)) {
    return next(new AppError('Access denied to this task', 403));
  }

  res.json({
    success: true,
    data: { task }
  });
});

// Create task (supervisor assigns to employee)
export const createTask = [
  body('workOrderId').isMongoId().withMessage('Invalid work order ID'),
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('stageId').isMongoId().withMessage('Invalid stage ID'),
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Task name must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('assignedTo').isMongoId().withMessage('Invalid assigned user ID'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetQuantity').isInt({ min: 1 }).withMessage('Target quantity must be at least 1'),
  body('dueDate').isISO8601().withMessage('Invalid due date'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    // Only supervisors and admins can create tasks
    if (![UserRole.ADMIN, UserRole.SUPERVISOR].includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    const {
      workOrderId,
      productId,
      stageId,
      assignedTo,
      ...taskData
    } = req.body;

    // Verify work order exists and belongs to company
    const workOrder = await WorkOrder.findById(workOrderId);
    if (!workOrder || workOrder.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Work order not found', 404));
    }

    // Verify product exists and belongs to company
    const product = await Product.findById(productId);
    if (!product || product.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Product not found', 404));
    }

    // Verify assigned user exists and belongs to company
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Assigned user not found', 404));
    }

    // Verify stage exists and belongs to company
    const stage = await mongoose.model('ProductionStage').findById(stageId);
    if (!stage || stage.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Production stage not found', 404));
    }

    const task = new Task({
      ...taskData,
      workOrderId,
      productId,
      stageId,
      assignedTo,
      assignedBy: req.user._id,
      supervisor: req.user.role === UserRole.SUPERVISOR ? req.user._id : req.body.supervisor || req.user._id,
      companyId: req.user.companyId
    });

    await task.save();

    logAudit(req.user._id.toString(), 'create', 'task', {
      taskId: task._id,
      taskName: task.name,
      assignedTo: assignedTo,
      workOrderId: workOrderId
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email')
      .populate('workOrderId', 'orderNumber productName')
      .populate('productId', 'name sku')
      .populate('stageId', 'name description');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask }
    });
  })
];

// Update task progress (employee updates)
export const updateTaskProgress = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('completedQuantity').isInt({ min: 0 }).withMessage('Completed quantity must be non-negative'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    const { id } = req.params;
    const { completedQuantity, notes } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Only assigned employee or supervisor can update progress
    if (req.user.role === UserRole.EMPLOYEE && task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update your assigned tasks', 403));
    }

    if (req.user.role === UserRole.SUPERVISOR && task.supervisor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update tasks you supervise', 403));
    }

    const previousQuantity = task.completedQuantity;
    await task.updateProgress(completedQuantity);

    if (notes) {
      task.notes = notes;
      await task.save();
    }

    // Update work order progress
    const workOrder = await WorkOrder.findById(task.workOrderId);
    if (workOrder) {
      await workOrder.updateStageProgress(task.stageId.toString(), completedQuantity);
    }

    logAudit(req.user._id.toString(), 'update_progress', 'task', {
      taskId: task._id,
      taskName: task.name,
      previousQuantity,
      newQuantity: completedQuantity
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email')
      .populate('workOrderId', 'orderNumber productName')
      .populate('productId', 'name sku')
      .populate('stageId', 'name description');

    res.json({
      success: true,
      message: 'Task progress updated successfully',
      data: { task: updatedTask }
    });
  })
];

// Complete quality check
export const completeQualityCheck = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('checkName').trim().notEmpty().withMessage('Check name is required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    const { id } = req.params;
    const { checkName, notes } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Only assigned employee or supervisor can complete quality checks
    if (req.user.role === UserRole.EMPLOYEE && task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only complete quality checks for your assigned tasks', 403));
    }

    if (req.user.role === UserRole.SUPERVISOR && task.supervisor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only complete quality checks for tasks you supervise', 403));
    }

    await task.completeQualityCheck(checkName, req.user._id.toString(), notes);

    logAudit(req.user._id.toString(), 'complete_quality_check', 'task', {
      taskId: task._id,
      taskName: task.name,
      checkName,
      notes
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email')
      .populate('workOrderId', 'orderNumber productName')
      .populate('productId', 'name sku')
      .populate('stageId', 'name description');

    res.json({
      success: true,
      message: 'Quality check completed successfully',
      data: { task: updatedTask }
    });
  })
];

// Update task (supervisor can update task details)
export const updateTask = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('name').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Task name must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (task.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Only supervisor or admin can update task details
    if (![UserRole.ADMIN, UserRole.SUPERVISOR].includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    if (req.user.role === UserRole.SUPERVISOR && task.supervisor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update tasks you supervise', 403));
    }

    // If reassigning, verify new user exists
    if (req.body.assignedTo) {
      const newUser = await User.findById(req.body.assignedTo);
      if (!newUser || newUser.companyId.toString() !== req.user.companyId.toString()) {
        return next(new AppError('Assigned user not found', 404));
      }
    }

    Object.assign(task, req.body);
    await task.save();

    logAudit(req.user._id.toString(), 'update', 'task', {
      taskId: task._id,
      taskName: task.name,
      changes: req.body
    });

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('supervisor', 'firstName lastName email')
      .populate('workOrderId', 'orderNumber productName')
      .populate('productId', 'name sku')
      .populate('stageId', 'name description');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });
  })
];

// Get task statistics
export const getTaskStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const companyId = req.user.companyId;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Base filters for role-based access
  let filter: any = { companyId };

  if (userRole === UserRole.EMPLOYEE) {
    filter.assignedTo = userId;
  } else if (userRole === UserRole.SUPERVISOR) {
    filter.$or = [{ supervisor: userId }, { assignedTo: userId }];
  }

  const stats = await Task.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalTasks = await Task.countDocuments(filter);
  const completedTasks = await Task.countDocuments({ ...filter, status: 'completed' });
  const overdueTasks = await Task.countDocuments({
    ...filter,
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  });

  res.json({
    success: true,
    data: {
      stats,
      summary: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    }
  });
});
