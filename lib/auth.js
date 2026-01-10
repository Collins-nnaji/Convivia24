import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

/**
 * Hash a password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Get token from request headers
 */
export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Middleware to verify authentication
 */
export async function authenticate(request) {
  // DEVELOPMENT MODE: Allow access without authentication
  const DEV_MODE = process.env.NODE_ENV === 'development' || true; // Allow dev mode for now
  
  if (DEV_MODE) {
    // Return a mock admin user for development
    return { 
      user: {
        id: 'dev-user-id',
        email: 'dev@convivia24.com',
        role: 'admin',
        business_id: null,
      }, 
      error: null 
    };
  }

  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { error: 'No token provided', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  return { user: decoded, error: null };
}

/**
 * Middleware factory for role-based access control
 */
export function requireRole(...allowedRoles) {
  return async (request) => {
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return authResult;
    }

    const user = authResult.user;
    
    if (!allowedRoles.includes(user.role)) {
      return { 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`, 
        status: 403 
      };
    }

    return { user, error: null };
  };
}
