import { Router } from 'express';
import { protect, restrictTo, supervisorOrHigher, adminOrHigher, auditAction } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getProductionStages,
  getProductionStageById,
  createProductionStage,
  updateProductionStage,
  updateStageProgress,
  deleteProductionStage,
  getWorkOrders,
  createWorkOrder,
  getProductionDashboard
} from '../controllers/productionController';

const router = Router();

/**
 * @swagger
 * /production/dashboard:
 *   get:
 *     summary: Get production dashboard data
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', protect, auditAction('read', 'production_dashboard'), getProductionDashboard);

/**
 * @swagger
 * /production/stages:
 *   get:
 *     summary: Get all production stages
 *     tags: [Production]
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
 *     responses:
 *       200:
 *         description: Production stages retrieved successfully
 */
router.get('/stages', protect, auditAction('read', 'production_stages'), getProductionStages);

/**
 * @swagger
 * /production/stages:
 *   post:
 *     summary: Create a new production stage
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - order
 *               - estimatedDuration
 *               - targetQuantity
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *               estimatedDuration:
 *                 type: integer
 *               targetQuantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Production stage created successfully
 */
router.post('/stages', protect, supervisorOrHigher, auditAction('create', 'production_stage'), createProductionStage);

/**
 * @swagger
 * /production/stages/{id}:
 *   get:
 *     summary: Get production stage by ID
 *     tags: [Production]
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
 *         description: Production stage retrieved successfully
 */
router.get('/stages/:id', protect, auditAction('read', 'production_stage'), getProductionStageById);

/**
 * @swagger
 * /production/stages/{id}:
 *   put:
 *     summary: Update production stage
 *     tags: [Production]
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
 *         description: Production stage updated successfully
 */
router.put('/stages/:id', protect, supervisorOrHigher, auditAction('update', 'production_stage'), updateProductionStage);

/**
 * @swagger
 * /production/stages/{id}/progress:
 *   put:
 *     summary: Update stage progress
 *     tags: [Production]
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
 *         description: Stage progress updated successfully
 */
router.put('/stages/:id/progress', protect, auditAction('update_progress', 'production_stage'), updateStageProgress);

/**
 * @swagger
 * /production/stages/{id}:
 *   delete:
 *     summary: Delete production stage
 *     tags: [Production]
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
 *         description: Production stage deleted successfully
 */
router.delete('/stages/:id', protect, adminOrHigher, auditAction('delete', 'production_stage'), deleteProductionStage);

/**
 * @swagger
 * /production/work-orders:
 *   get:
 *     summary: Get all work orders
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Work orders retrieved successfully
 */
router.get('/work-orders', protect, auditAction('read', 'work_orders'), getWorkOrders);

/**
 * @swagger
 * /production/work-orders:
 *   post:
 *     summary: Create a new work order
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Work order created successfully
 */
router.post('/work-orders', protect, supervisorOrHigher, auditAction('create', 'work_order'), createWorkOrder);

export default router;