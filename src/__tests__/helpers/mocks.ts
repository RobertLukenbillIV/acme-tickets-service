/**
 * Shared test mocks and helpers
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockPrismaClient: any = {
  ticket: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  ticketActivity: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  webhook: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  webhookDelivery: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  tenant: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  attachment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn((callback: any) => callback(mockPrismaClient)),
};

export const mockS3 = {
  getSignedUrl: jest.fn(),
  putObject: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  }),
  deleteObject: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({}),
  }),
};

export const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  setex: jest.fn(),
};

export const mockBullQueue = {
  add: jest.fn(),
  process: jest.fn(),
  on: jest.fn(),
};

// Mock JWT tokens
export const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN' as const,
  tenantId: 'tenant-123',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTenant = {
  id: 'tenant-123',
  name: 'Test Tenant',
  domain: 'test.example.com',
  settings: {},
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTicket = {
  id: 'ticket-123',
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'OPEN' as const,
  priority: 'MEDIUM' as const,
  tenantId: 'tenant-123',
  createdById: 'user-123',
  assignedToId: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockComment = {
  id: 'comment-123',
  content: 'Test comment',
  ticketId: 'ticket-123',
  authorId: 'user-123',
  isInternal: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockNotification = {
  id: 'notification-123',
  type: 'TICKET_CREATED' as const,
  title: 'New Ticket',
  message: 'A new ticket was created',
  userId: 'user-123',
  isRead: false,
  metadata: {},
  createdAt: new Date(),
};

export const mockWebhook = {
  id: 'webhook-123',
  url: 'https://example.com/webhook',
  events: ['ticket.created'],
  isActive: true,
  tenantId: 'tenant-123',
  secret: 'webhook-secret',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  Object.values(mockPrismaClient).forEach((model: any) => {
    if (typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (typeof method?.mockClear === 'function') {
          method.mockClear();
        }
      });
    }
  });
  
  Object.values(mockS3).forEach((method: any) => {
    if (typeof method?.mockClear === 'function') {
      method.mockClear();
    }
  });
  
  Object.values(mockRedis).forEach((method: any) => {
    if (typeof method?.mockClear === 'function') {
      method.mockClear();
    }
  });
};

// Mock Express Request
export const mockRequest = (overrides?: any) => ({
  body: {},
  params: {},
  query: {},
  user: mockUser,
  headers: {},
  ...overrides,
});

// Mock Express Response
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock Express Next function
export const mockNext = jest.fn();

// Dummy test to prevent "no tests" error
describe('Test helpers', () => {
  it('should export mock utilities', () => {
    expect(mockUser).toBeDefined();
    expect(mockRequest).toBeDefined();
    expect(mockResponse).toBeDefined();
  });
});
