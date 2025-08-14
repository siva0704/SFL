import { Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { Product } from '../models/Product';
import { ProductionStage } from '../models/ProductionStage';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, UserRole } from '../types';
import { logInfo, logAudit } from '../utils/logger';
import mongoose from 'mongoose';

// Get all products
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, status, category } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter: any = { companyId: req.user.companyId };
  
  if (status) filter.status = status;
  if (category) filter.category = category;

  const products = await Product.find(filter)
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: skip + products.length < total,
        hasPrev: Number(page) > 1
      }
    }
  });
});

// Get product by ID
export const getProductById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  const product = await Product.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('processStages.stageId', 'name description estimatedDuration');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.companyId.toString() !== req.user.companyId.toString()) {
    return next(new AppError('Access denied', 403));
  }

  res.json({
    success: true,
    data: { product }
  });
});

// Create product with process stages
export const createProduct = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('sku').trim().isLength({ min: 2, max: 50 }).withMessage('SKU must be between 2 and 50 characters'),
  body('category').trim().isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters'),
  body('processStages').isArray({ min: 1 }).withMessage('At least one process stage is required'),
  body('processStages.*.name').trim().isLength({ min: 2, max: 100 }).withMessage('Stage name must be between 2 and 100 characters'),
  body('processStages.*.order').isInt({ min: 1 }).withMessage('Stage order must be a positive integer'),
  body('processStages.*.estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    // Only admins can create products
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Only admins can create products', 403));
    }

    const { processStages, ...productData } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku, companyId: req.user.companyId });
    if (existingProduct) {
      return next(new AppError('Product with this SKU already exists', 400));
    }

    // Create production stages first
    const createdStages = [];
    for (const stageData of processStages) {
      const stage = new ProductionStage({
        ...stageData,
        companyId: req.user.companyId,
        status: 'planned'
      });
      await stage.save();
      createdStages.push(stage);
    }

    // Create product with stage references
    const product = new Product({
      ...productData,
      companyId: req.user.companyId,
      createdBy: req.user._id,
      processStages: createdStages.map((stage, index) => ({
        stageId: stage._id,
        order: processStages[index].order,
        name: processStages[index].name,
        description: processStages[index].description,
        estimatedDuration: processStages[index].estimatedDuration,
        requiredSkills: processStages[index].requiredSkills || [],
        qualityChecks: processStages[index].qualityChecks || []
      }))
    });

    await product.save();

    logAudit(req.user._id.toString(), 'create', 'product', {
      productId: product._id,
      productName: product.name,
      stageCount: createdStages.length
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('processStages.stageId', 'name description estimatedDuration');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: populatedProduct }
    });
  })
];

// Update product
export const updateProduct = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Only admins can update products
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Only admins can update products', 403));
    }

    Object.assign(product, req.body);
    await product.save();

    logAudit(req.user._id.toString(), 'update', 'product', {
      productId: product._id,
      productName: product.name,
      changes: req.body
    });

    const updatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('processStages.stageId', 'name description estimatedDuration');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  })
];

// Delete product
export const deleteProduct = [
  param('id').isMongoId().withMessage('Invalid product ID'),

  asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400));
    }

    // Only admins can delete products
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Only admins can delete products', 403));
    }

    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.companyId.toString() !== req.user.companyId.toString()) {
      return next(new AppError('Access denied', 403));
    }

    // Check if product is being used in work orders
    // TODO: Add check for work orders using this product

    await Product.findByIdAndDelete(id);

    logAudit(req.user._id.toString(), 'delete', 'product', {
      productId: product._id,
      productName: product.name
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  })
];

// Get product categories
export const getProductCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await Product.distinct('category', { companyId: req.user.companyId });

  res.json({
    success: true,
    data: { categories }
  });
});

// Get product statistics
export const getProductStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await Product.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(req.user.companyId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalProducts = await Product.countDocuments({ companyId: req.user.companyId });
  const activeProducts = await Product.countDocuments({ 
    companyId: req.user.companyId, 
    status: 'active' 
  });

  res.json({
    success: true,
    data: {
      stats,
      summary: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts
      }
    }
  });
});
