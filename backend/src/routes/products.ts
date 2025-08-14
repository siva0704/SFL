import { Router } from 'express';
import { protect, restrictTo, adminOrHigher, auditAction } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getProductStats
} from '../controllers/productController';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', protect, auditAction('read', 'products'), getProducts);

/**
 * @swagger
 * /products/stats:
 *   get:
 *     summary: Get product statistics
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product statistics retrieved successfully
 */
router.get('/stats', protect, auditAction('read', 'product_stats'), getProductStats);

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Get product categories
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product categories retrieved successfully
 */
router.get('/categories', protect, auditAction('read', 'product_categories'), getProductCategories);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product with process stages
 *     tags: [Products]
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
 *               - sku
 *               - category
 *               - processStages
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               specifications:
 *                 type: object
 *               processStages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     order:
 *                       type: integer
 *                     description:
 *                       type: string
 *                     estimatedDuration:
 *                       type: integer
 *                     requiredSkills:
 *                       type: array
 *                       items:
 *                         type: string
 *                     qualityChecks:
 *                       type: array
 *                       items:
 *                         type: object
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/', protect, adminOrHigher, auditAction('create', 'product'), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
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
 *         description: Product retrieved successfully
 */
router.get('/:id', protect, auditAction('read', 'product'), getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
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
 *         description: Product updated successfully
 */
router.put('/:id', protect, adminOrHigher, auditAction('update', 'product'), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
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
 *         description: Product deleted successfully
 */
router.delete('/:id', protect, adminOrHigher, auditAction('delete', 'product'), deleteProduct);

export default router;
