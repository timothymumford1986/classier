import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      schoolId: decoded.schoolId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user is school admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * Middleware to ensure user can only access their school's data
 */
export const validateSchoolAccess = (req, res, next) => {
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;

  if (!schoolId) {
    return res.status(400).json({ error: 'School ID required' });
  }

  if (schoolId !== req.user.schoolId) {
    return res.status(403).json({ error: 'Access denied to this school' });
  }

  next();
};
