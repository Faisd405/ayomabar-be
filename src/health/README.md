# Health Check Module

This module provides comprehensive health check endpoints for monitoring the application's status and dependencies.

## Features

- ✅ **Database Health Check** - Verifies Prisma database connectivity
- ✅ **Memory Health Check** - Monitors heap and RSS memory usage
- ✅ **Disk Health Check** - Monitors available disk space
- ✅ **Public Endpoints** - No authentication required
- ✅ **Swagger Documentation** - API docs available
- ✅ **Unit Tests** - Complete test coverage

## Endpoints

### 1. Complete Health Check
**GET** `/api/health`

Returns comprehensive health status including:
- Database connectivity
- Memory usage (heap and RSS)
- Disk space availability

**Response (200 OK):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up",
      "message": "Database connection is healthy"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up",
      "message": "Database connection is healthy"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "storage": {
      "status": "up"
    }
  }
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "error",
  "info": {
    "memory_heap": {
      "status": "up"
    }
  },
  "error": {
    "database": {
      "status": "down",
      "message": "Database connection failed: Connection refused"
    }
  },
  "details": {
    "database": {
      "status": "down",
      "message": "Database connection failed: Connection refused"
    },
    "memory_heap": {
      "status": "up"
    }
  }
}
```

### 2. Simple Ping
**GET** `/api/health/ping`

Quick endpoint to check if the application is running.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "pong",
  "timestamp": "2025-10-24T10:30:00.000Z"
}
```

### 3. Database Health Only
**GET** `/api/health/database`

Checks only the database connectivity.

**Response (200 OK):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up",
      "message": "Database connection is healthy"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up",
      "message": "Database connection is healthy"
    }
  }
}
```

## Health Check Thresholds

The module monitors the following thresholds:

| Check | Threshold | Description |
|-------|-----------|-------------|
| **Database** | Connection test | Executes `SELECT 1` query |
| **Memory Heap** | 150 MB | Maximum heap memory usage |
| **Memory RSS** | 300 MB | Maximum RSS memory usage |
| **Disk Space** | 50% free | Minimum free disk space percentage |

## Usage Examples

### Using curl
```bash
# Complete health check
curl http://localhost:3000/api/health

# Simple ping
curl http://localhost:3000/api/health/ping

# Database only
curl http://localhost:3000/api/health/database
```

### Using in Kubernetes
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nestjs-app
spec:
  containers:
  - name: app
    image: your-nestjs-app
    livenessProbe:
      httpGet:
        path: /api/health/ping
        port: 3000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /api/health
        port: 3000
      initialDelaySeconds: 10
      periodSeconds: 5
```

### Using in Docker Compose
```yaml
services:
  app:
    image: your-nestjs-app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Monitoring Integration

### Prometheus
You can integrate with Prometheus for monitoring:

```typescript
// Example: Add metrics endpoint
@Get('metrics')
async getMetrics() {
  const health = await this.check();
  // Convert to Prometheus format
  return convertToPrometheusFormat(health);
}
```

### Datadog / New Relic
Use the health endpoints with your monitoring service:

```javascript
// Example: Health check integration
setInterval(async () => {
  const response = await fetch('http://localhost:3000/api/health');
  const health = await response.json();
  
  // Send to monitoring service
  if (health.status !== 'ok') {
    alert('Application unhealthy!');
  }
}, 60000); // Check every minute
```

## Testing

Run the health module tests:

```bash
# Run all health tests
pnpm test health

# Run with coverage
pnpm test:cov health

# Watch mode
pnpm test:watch health
```

## Architecture

```
src/health/
├── health.controller.ts       # Health check endpoints
├── health.controller.spec.ts  # Controller tests
├── health.module.ts           # Module configuration
├── prisma.health.ts          # Custom Prisma health indicator
├── prisma.health.spec.ts     # Prisma health tests
├── index.ts                  # Barrel exports
└── README.md                 # This file
```

## Customization

### Adjusting Thresholds

Edit `health.controller.ts` to adjust health check thresholds:

```typescript
// Increase memory heap threshold to 200MB
() => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),

// Change disk space threshold to 30%
() => this.disk.checkStorage('storage', {
  path: '/',
  thresholdPercent: 0.3,
}),
```

### Adding Custom Health Indicators

Create a new health indicator:

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redis: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Redis failed', this.getStatus(key, false));
    }
  }
}
```

Add to your health check:

```typescript
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.prismaHealth.isHealthy('database'),
    () => this.redisHealth.isHealthy('redis'), // Add custom check
  ]);
}
```

## Best Practices

1. **Use `/health/ping` for liveness probes** - Fast and lightweight
2. **Use `/health` for readiness probes** - Comprehensive dependency checks
3. **Monitor regularly** - Set up automated monitoring
4. **Alert on failures** - Configure alerts when health checks fail
5. **Adjust thresholds** - Based on your application's requirements

## Dependencies

- `@nestjs/terminus` - NestJS health check module
- `@nestjs/axios` - HTTP health checks support
- `axios` - HTTP client

## Troubleshooting

### Health check returns 503
- **Database down**: Check database connectivity
- **Memory exceeded**: Check for memory leaks
- **Disk full**: Free up disk space

### Health endpoint not accessible
- Ensure the endpoint is public (uses `@Public()` decorator)
- Check that HealthModule is imported in AppModule
- Verify the application is running

## Related Documentation

- [NestJS Terminus Documentation](https://docs.nestjs.com/recipes/terminus)
- [Health Check Pattern](https://microservices.io/patterns/observability/health-check-api.html)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
