import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// TODO: Add company routes implementation
// GET /api/v1/companies - Get all companies (super admin only)
// GET /api/v1/companies/:id - Get company by ID
// POST /api/v1/companies - Create new company
// PUT /api/v1/companies/:id - Update company
// DELETE /api/v1/companies/:id - Delete company (super admin only)

router.get('/', protect, restrictTo(UserRole.SUPER_ADMIN), (_req, res) => {
  res.status(200).json({ message: 'Companies route - TODO: implement' });
});

export default router; 