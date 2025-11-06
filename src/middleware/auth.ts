import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    tenantId: string;
    roles: string[];
    scopes: string[];
  };
}

interface JwtPayload {
  sub: string; // email
  tenant_id: string; // UUID string
  roles: string[]; // ['ROLE_USER', 'ROLE_AGENT', 'ROLE_ADMIN']
  scopes: string[]; // ['tickets:read:own', 'tickets:write:any', etc.]
  iat: number;
  exp: number;
}

// Map acme-auth-service roles to Prisma UserRole enum
const mapRoleFromToken = (roles: string[]): UserRole => {
  if (roles.includes('ROLE_ADMIN')) return UserRole.ADMIN;
  if (roles.includes('ROLE_AGENT')) return UserRole.AGENT;
  return UserRole.USER;
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    // Verify JWT from acme-auth-service
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Extract claims from token
    const email = decoded.sub;
    const tenantId = decoded.tenant_id;
    const roles = decoded.roles || [];
    const scopes = decoded.scopes || [];

    // Lookup user in database by email to get user ID
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, tenantId: true, role: true }
    });

    if (!user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Verify tenant_id matches
    if (user.tenantId !== tenantId) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Tenant mismatch',
        timestamp: new Date().toISOString()
      });
    }

    // Map role from token
    const mappedRole = mapRoleFromToken(roles);

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: mappedRole,
      tenantId: tenantId,
      roles: roles,
      scopes: scopes
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token expired',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

export const checkTenantAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      timestamp: new Date().toISOString()
    });
  }

  const tenantId = req.params.tenantId || req.body.tenantId;

  if (tenantId && tenantId !== req.user.tenantId && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Access denied to this tenant',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Helper to check if user has required scope
export const requireScope = (...scopes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    const userScopes = req.user.scopes || [];
    const hasScope = scopes.some(scope => userScopes.includes(scope));

    if (!hasScope) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Helper to check if user can access a specific ticket
export const canAccessTicket = (ticket: { createdById: string; assignedToId: string | null }, user: AuthRequest['user']): boolean => {
  if (!user) return false;
  
  // ADMIN can access any ticket
  if (user.role === UserRole.ADMIN) return true;
  
  // AGENT can access any ticket in their tenant (already filtered by tenantId)
  if (user.role === UserRole.AGENT) return true;
  
  // USER can only access tickets they created
  return ticket.createdById === user.id;
};

// Helper to check if user can modify a specific ticket
export const canModifyTicket = (ticket: { createdById: string; assignedToId: string | null }, user: AuthRequest['user']): boolean => {
  if (!user) return false;
  
  // ADMIN can modify any ticket
  if (user.role === UserRole.ADMIN) return true;
  
  // AGENT can modify tickets assigned to them or any ticket in their tenant
  if (user.role === UserRole.AGENT) {
    return ticket.assignedToId === user.id || user.scopes.includes('tickets:write:any');
  }
  
  // USER can only modify tickets they created
  return ticket.createdById === user.id;
};
