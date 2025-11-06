import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app: Application = express();

// Trust proxy for Codespaces/reverse proxy environments
app.set('trust proxy', true);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tickets Service API',
      version: '1.0.0',
      description: `Multi-tenant ticket management API with role-based access control.
      
## Authentication

This service validates JWT tokens issued by **acme-auth-service**.

### JWT Token Structure

Tokens must be included in the Authorization header as: \`Bearer <token>\`

**Token Claims:**
- \`sub\`: User email address
- \`tenant_id\`: UUID string for tenant isolation
- \`roles\`: Array of roles (\`ROLE_USER\`, \`ROLE_AGENT\`, \`ROLE_ADMIN\`)
- \`scopes\`: Array of permission scopes (e.g., \`tickets:read:own\`, \`tickets:write:any\`)

### Role Permissions

- **ROLE_USER**: Can create tickets and view/modify only their own tickets
- **ROLE_AGENT**: Can view/modify all tickets within their tenant, including assignment
- **ROLE_ADMIN**: Full access to all tickets and tenant resources, including deletion

### Scope Examples

- \`tickets:read:own\` - Read tickets created by the user
- \`tickets:read:any\` - Read all tickets in tenant
- \`tickets:write:own\` - Modify tickets created by the user
- \`tickets:write:any\` - Modify any ticket in tenant
- \`tickets:delete:any\` - Delete tickets (ADMIN only)

**Important:** JWT_SECRET must match the secret used by acme-auth-service for token validation.`,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from acme-auth-service with tenant_id, roles, and scopes',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              enum: ['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR', 'CONFLICT', 'INTERNAL_ERROR'],
              description: 'Error code matching acme-contracts',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'ISO 8601 timestamp of when the error occurred',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                  code: {
                    type: 'string',
                  },
                },
              },
              description: 'Additional error details (for validation errors)',
            },
          },
          required: ['code', 'message', 'timestamp'],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
// Configure CORS before other middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // Must be false when using wildcard origin
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use(config.apiPrefix, routes);

// Error handling
app.use(errorHandler);

export default app;
