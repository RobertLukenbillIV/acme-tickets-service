import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TenantService } from '../services/tenant.service';

const tenantService = new TenantService();

export class TenantController {
  async createTenant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.createTenant(req.body);
      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async getTenants(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenants = await tenantService.listTenants();
      res.json(tenants);
    } catch (error) {
      next(error);
    }
  }

  async getTenantById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.getTenantById(req.params.id);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await tenantService.updateTenant(req.params.id, req.body);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await tenantService.deleteTenant(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
