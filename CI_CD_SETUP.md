# CI/CD Setup for ACME Tickets Service

This document explains the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the ACME Tickets Service API.

## Overview

The CI/CD pipeline is built with **GitHub Actions** and automatically runs on:
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests targeting `main` or `develop`
- Tagged releases (for production deployment)

## Pipeline Stages

### 1. **Lint** 🔍
- **Runs**: ESLint and Prettier format checks
- **Purpose**: Ensure code quality and consistent formatting
- **Commands**:
  ```bash
  npm run lint        # Check for linting errors
  npm run format      # Check formatting (CI mode)
  ```

### 2. **Test** ✅
- **Runs**: Jest unit tests with coverage reporting
- **Purpose**: Verify all functionality works correctly
- **Generates**: Code coverage reports uploaded to Codecov
- **Commands**:
  ```bash
  npm run test            # Run all tests
  npm run test:coverage   # Run with coverage report
  ```
- **Coverage Threshold**: Aim for >80% code coverage

### 3. **Build** 🔨
- **Runs**: TypeScript compilation
- **Purpose**: Verify the code compiles without errors
- **Generates**: `dist/` folder with compiled JavaScript
- **Commands**:
  ```bash
  npm run build          # Compile TypeScript
  ```

### 4. **Docker Build** 🐳
- **Runs**: Builds multi-platform Docker image
- **Purpose**: Create production-ready container
- **Registry**: GitHub Container Registry (ghcr.io)
- **Platforms**: linux/amd64, linux/arm64
- **Tags**:
  - `main` → `ghcr.io/owner/repo:main`
  - `v1.2.3` → `ghcr.io/owner/repo:v1.2.3`, `ghcr.io/owner/repo:v1.2`
  - PRs → `ghcr.io/owner/repo:pr-123`
  - Commits → `ghcr.io/owner/repo:main-abc1234`

### 5. **Security Scan** 🔒
- **Runs**: Trivy vulnerability scanner + NPM audit
- **Purpose**: Detect security vulnerabilities
- **Reports**: Uploaded to GitHub Security tab
- **Severity**: Fails on CRITICAL/HIGH vulnerabilities

### 6. **Deploy to Staging** 🚀
- **Trigger**: Push to `main` branch
- **Environment**: staging
- **URL**: https://acme-tickets-staging.onrender.com
- **Process**:
  1. Triggers Render deploy hook
  2. Waits 60 seconds
  3. Runs health check (retries 10 times)

### 7. **Deploy to Production** 🎯
- **Trigger**: Git tags starting with `v` (e.g., `v1.0.0`)
- **Environment**: production
- **URL**: https://acme-tickets-api.onrender.com
- **Process**:
  1. Triggers Render deploy hook
  2. Waits 90 seconds
  3. Runs health check (retries 15 times)
  4. Creates GitHub Release with changelog

## Required Secrets

Configure these in **GitHub Repository Settings → Secrets and variables → Actions**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CODECOV_TOKEN` | Codecov upload token (optional) | `abc123...` |
| `RENDER_DEPLOY_HOOK_STAGING` | Render staging webhook URL | `https://api.render.com/deploy/srv-...` |
| `RENDER_DEPLOY_HOOK_PRODUCTION` | Render production webhook URL | `https://api.render.com/deploy/srv-...` |

### How to get Render Deploy Hooks:
1. Go to Render Dashboard → Your Service
2. Settings → Deploy Hooks
3. Create a new deploy hook
4. Copy the URL and add to GitHub Secrets

## Test Coverage

Current test coverage:
- ✅ Services: `ticket.service`, `auth.service`, `comment.service`
- ⚠️ Partial: Other services need tests
- 📝 TODO: Controllers, middleware, integration tests

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Deployment Workflow

### Deploying to Staging
```bash
git checkout main
git pull origin main
git push origin main
# CI/CD will automatically deploy to staging
```

### Deploying to Production
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
# CI/CD will automatically deploy to production
```

### Manual Rollback
If deployment fails, you can:
1. Revert to previous image in Render dashboard
2. Or deploy a previous tag:
   ```bash
   git push origin :refs/tags/v1.0.0  # Delete bad tag
   git tag v1.0.1 <previous-commit>   # Create new tag
   git push origin v1.0.1             # Deploy
   ```

## Build Optimization

The Docker build uses:
- **Multi-stage build**: Smaller final image
- **Layer caching**: GitHub Actions cache for faster builds
- **Multi-platform**: Supports both AMD64 and ARM64

## Monitoring

After deployment, monitor:
- **Health endpoint**: `GET /health` should return `{"status":"ok"}`
- **Logs**: Check Render dashboard for application logs
- **Metrics**: Monitor response times and error rates
- **Security**: Review GitHub Security tab for vulnerabilities

## Troubleshooting

### Tests failing in CI but passing locally
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure `.env` is not required for tests (use mocks)
- Check Node.js version matches (18.x)

### Docker build failing
- Test locally: `docker build -t acme-tickets .`
- Check Dockerfile syntax
- Verify all dependencies in package.json

### Deployment health check failing
- Check Render logs for startup errors
- Verify environment variables are set correctly
- Ensure DATABASE_URL is accessible
- Check Redis connection

### Security scan failing
- Run `npm audit` locally
- Update vulnerable packages: `npm audit fix`
- Review Trivy report in GitHub Security tab

## Local Development

Before pushing code:
```bash
# 1. Run linter
npm run lint

# 2. Run tests
npm test

# 3. Build TypeScript
npm run build

# 4. Run format check
npm run format

# 5. (Optional) Test Docker build
docker build -t acme-tickets .
docker run -p 3000:3000 --env-file .env acme-tickets
```

## Branch Protection Rules

Recommended settings for `main` branch:
- ✅ Require pull request reviews (1 approver)
- ✅ Require status checks to pass: `lint`, `test`, `build`
- ✅ Require branches to be up to date
- ✅ Require signed commits (optional)
- ❌ Do not allow force pushes

## Next Steps

1. **Add integration tests**: Test full API workflows
2. **Add E2E tests**: Test with real database (Docker Compose)
3. **Set up monitoring**: Add Datadog, Sentry, or similar
4. **Performance tests**: Load testing with k6 or Artillery
5. **API documentation**: Auto-generate from OpenAPI/Swagger

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
