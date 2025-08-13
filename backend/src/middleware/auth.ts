import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { AppError } from './errorHandler';
import { AuthRequest, JWTPayload, UserRole } from '../types';
import { logAudit } from '../utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      company?: any;
    }
  }
}

// Protect routes - require authentication
export const protect = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId).select('+password');
    if (!currentUser) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // Check if user changed password after the token was issued
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
      if (decoded.iat! < changedTimestamp) {
        throw new AppError('User recently changed password! Please log in again.', 401);
      }
    }

    // Check if user is active
    if (currentUser.status !== 'active') {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    // Get company information
    const company = await Company.findById(decoded.companyId);
    if (!company) {
      throw new AppError('Company not found.', 404);
    }

    // Check if company is active
    if (company.status !== 'active') {
      throw new AppError('Your company account has been deactivated. Please contact support.', 401);
    }

    // Check if subscription is active
    if (!company.isSubscriptionActive()) {
      throw new AppError('Your subscription has expired. Please renew to continue.', 401);
    }

    // Grant access to protected route
    req.user = currentUser;
    req.company = company;

    // Update last login
    currentUser.lastLogin = new Date();
    await currentUser.save({ validateBeforeSave: false });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Your token has expired! Please log in again.', 401));
    } else {
      next(error);
    }
  }
};

// Restrict to certain roles
export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('You are not logged in. Please log in to get access.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action.', 403));
      return;
    }

    next();
  };
};

// Check module access
export const requireModule = (module: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.company) {
      next(new AppError('Company information not found.', 404));
      return;
    }

    if (!req.company.hasModuleAccess(module)) {
      next(new AppError(`Module '${module}' is not available for your company.`, 403));
      return;
    }

    next();
  };
};

// Check feature access
export const requireFeature = (feature: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.company) {
      next(new AppError('Company information not found.', 404));
      return;
    }

    if (!req.company.hasFeatureAccess(feature)) {
      next(new AppError(`Feature '${feature}' is not available for your company.`, 403));
      return;
    }

    next();
  };
};

// Super admin only
export const superAdminOnly = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError('You are not logged in. Please log in to get access.', 401));
    return;
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    next(new AppError('Access denied. Super admin privileges required.', 403));
    return;
  }

  next();
};

// Admin or higher
export const adminOrHigher = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError('You are not logged in. Please log in to get access.', 401));
    return;
  }

  const allowedRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
  if (!allowedRoles.includes(req.user.role)) {
    next(new AppError('Access denied. Admin privileges required.', 403));
    return;
  }

  next();
};

// Supervisor or higher
export const supervisorOrHigher = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new AppError('You are not logged in. Please log in to get access.', 401));
    return;
  }

  const allowedRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR];
  if (!allowedRoles.includes(req.user.role)) {
    next(new AppError('Access denied. Supervisor privileges required.', 403));
    return;
  }

  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;
      const currentUser = await User.findById(decoded.userId);
      const company = await Company.findById(decoded.companyId);

      if (currentUser && company && currentUser.status === 'active' && company.status === 'active') {
        req.user = currentUser;
        req.company = company;
      }
    }

    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue
    next();
  }
};

// Audit middleware for logging user actions
export const auditAction = (action: string, resource: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (req.user) {
      logAudit(
        req.user._id.toString(),
        action,
        resource,
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      );
    }
    next();
  };
}; 