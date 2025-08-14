import { Router } from 'express';
import { protect, restrictTo, supervisorOrHigher, adminOrHigher, auditAction } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTaskProgress,
  completeQualityCheck,
  updateTask,
  getTaskStats
} from '../controllers/taskController';

const router = Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks (role-based filtering)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/', protect, auditAction('read', 'tasks'), getTasks);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics retrieved successfully
 */
router.get('/stats', protect, auditAction('read', 'task_stats'), getTaskStats);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task (supervisor assigns to employee)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workOrderId
 *               - productId
 *               - stageId
 *               - name
 *               - assignedTo
 *               - priority
 *               - targetQuantity
 *               - dueDate
 *               - estimatedDuration
 *             properties:
 *               workOrderId:
 *                 type: string
 *               productId:
 *                 type: string
 *               stageId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               targetQuantity:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               estimatedDuration:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', protect, supervisorOrHigher, auditAction('create', 'task'), createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 */
router.get('/:id', protect, auditAction('read', 'task'), getTaskById);

/**
 * @swagger
 * /tasks/{id}/progress:
 *   put:
 *     summary: Update task progress (employee updates)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completedQuantity
 *             properties:
 *               completedQuantity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task progress updated successfully
 */
router.put('/:id/progress', protect, auditAction('update_progress', 'task'), updateTaskProgress);

/**
 * @swagger
 * /tasks/{id}/quality-check:
 *   put:
 *     summary: Complete quality check
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkName
 *             properties:
 *               checkName:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quality check completed successfully
 */
router.put('/:id/quality-check', protect, auditAction('complete_quality_check', 'task'), completeQualityCheck);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update task (supervisor can update task details)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put('/:id', protect, supervisorOrHigher, auditAction('update', 'task'), updateTask);

export default router;
