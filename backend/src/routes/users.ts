import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// TODO: Add user routes implementation
// GET /api/v1/users - Get all users (admin only)
// GET /api/v1/users/:id - Get user by ID
// PUT /api/v1/users/:id - Update user
// DELETE /api/v1/users/:id - Delete user (admin only)

router.get('/', protect, restrictTo(UserRole.ADMIN, UserRole.SUPER_ADMIN), (_req, res) => {
  res.status(200).json({ message: 'Users route - TODO: implement' });
});

export default router; 