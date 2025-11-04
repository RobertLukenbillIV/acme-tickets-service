import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class TenantService {
  async createTenant(data: { name: string; slug: string; settings?: object }) {
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existingTenant) {
      throw new AppError(400, 'Tenant with this slug already exists', 'CONFLICT');
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        settings: data.settings || {},
      },
    });

    return tenant;
  }

  async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            tickets: true,
            webhooks: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
    }

    return tenant;
  }

  async getTenantBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
    }

    return tenant;
  }

  async updateTenant(id: string, data: { name?: string; slug?: string; settings?: object }) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
    }

    if (data.slug && data.slug !== tenant.slug) {
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: data.slug },
      });

      if (existingTenant) {
        throw new AppError(400, 'Tenant with this slug already exists', 'CONFLICT');
      }
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
    }

    await prisma.tenant.delete({
      where: { id },
    });
  }

  async listTenants() {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tenants;
  }
}
