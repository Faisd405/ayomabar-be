# Rate Limiting

This project implements comprehensive rate limiting using `@nestjs/throttler` to protect the API from abuse and ensure fair usage.

## Features

- ✅ **Global Rate Limiting** - Applied to all endpoints by default
- ✅ **Multiple Rate Limit Tiers** - Short, medium, and long-term limits
- ✅ **Custom Decorators** - Fine-grained control per endpoint
- ✅ **Custom Error Messages** - User-friendly rate limit responses
- ✅ **Skip Throttling** - Bypass rate limits for specific endpoints
- ✅ **Configurable** - Easy to adjust limits

## Rate Limit Tiers

The application uses three rate limit tiers:

| Tier | Duration | Limit | Use Case |
|------|----------|-------|----------|
| **Short** | 1 second | 3 requests | Anti-spam protection |
| **Medium** | 10 seconds | 20 requests | General API usage |
| **Long** | 1 minute | 100 requests | Overall usage limit |

All three limits must be satisfied for a request to succeed.

## Configuration

Rate limits are configured in `src/app.module.ts`:

```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 3, // 3 requests per second
  },
  {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 20, // 20 requests per 10 seconds
  },
  {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
]),
```

## Usage

### Default Behavior

All endpoints are rate-limited by default with the configured tiers.

```typescript
@Controller('users')
export class UserController {
  @Get()
  findAll() {
    // This endpoint is automatically rate-limited
    return this.userService.findAll();
  }
}
```

### Skip Rate Limiting

Use the `@SkipThrottle()` decorator to bypass rate limiting:

```typescript
import { SkipThrottle } from '@common/decorators';

@Controller('health')
export class HealthController {
  @SkipThrottle() // No rate limiting
  @Get('ping')
  ping() {
    return { message: 'pong' };
  }
}
```

### Custom Rate Limits

Use the `@Throttle()` decorator for endpoint-specific limits:

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Throttle({ limit: 5, ttl: 60000 }) // 5 requests per minute
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    // Strict rate limit for login attempts
    return this.authService.login(loginDto);
  }
}
```

## Response Format

When rate limit is exceeded, the API returns:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "success": false,
  "statusCode": 429,
  "timestamp": "2025-10-24T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "GET",
  "message": "Too many requests. Please try again later.",
  "error": "Rate Limit Exceeded"
}
```

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1635084600
Retry-After: 60
```

## Examples

### Example 1: Protecting Login Endpoint

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  // Strict limit: 5 login attempts per minute
  @Throttle({ limit: 5, ttl: 60000 })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  // More relaxed for registration
  @Throttle({ limit: 10, ttl: 60000 })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
```

### Example 2: Public Endpoints Without Rate Limiting

```typescript
import { SkipThrottle } from '@common/decorators';

@Controller('public')
export class PublicController {
  @SkipThrottle()
  @Get('status')
  getStatus() {
    return { status: 'ok', timestamp: new Date() };
  }
  
  @SkipThrottle()
  @Get('version')
  getVersion() {
    return { version: '1.0.0' };
  }
}
```

### Example 3: Different Limits for Different HTTP Methods

```typescript
@Controller('posts')
export class PostsController {
  // Relaxed for reading
  @Throttle({ limit: 100, ttl: 60000 })
  @Get()
  findAll() {
    return this.postsService.findAll();
  }
  
  // Strict for writing
  @Throttle({ limit: 10, ttl: 60000 })
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }
  
  // Very strict for deletion
  @Throttle({ limit: 5, ttl: 60000 })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
```

## Testing Rate Limits

### Using curl

```bash
# Test rate limit by making rapid requests
for i in {1..10}; do
  curl -w "\nStatus: %{http_code}\n" http://localhost:3000/api/v1/users
  sleep 0.1
done
```

### Using JavaScript

```javascript
async function testRateLimit() {
  const url = 'http://localhost:3000/api/v1/users';
  
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch(url);
      console.log(`Request ${i + 1}: ${response.status}`);
      
      if (response.status === 429) {
        const data = await response.json();
        console.log('Rate limited:', data.message);
        break;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testRateLimit();
```

### Using Postman

1. Create a request to any endpoint
2. Use the Collection Runner
3. Set iterations to 10-20
4. Set delay to 0ms
5. Run and observe 429 responses after hitting the limit

## Storage Options

By default, throttler uses in-memory storage. For production with multiple instances, consider using Redis:

### Install Redis Storage

```bash
pnpm add @nestjs/throttler-storage-redis redis
```

### Configure Redis Storage

```typescript
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';
import Redis from 'redis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 3 },
          { name: 'medium', ttl: 10000, limit: 20 },
          { name: 'long', ttl: 60000, limit: 100 },
        ],
        storage: new ThrottlerStorageRedisService(
          Redis.createClient({
            url: process.env.REDIS_URL,
          }),
        ),
      }),
    }),
  ],
})
export class AppModule {}
```

## Advanced Configuration

### Environment-Based Limits

```typescript
// src/config/throttler.config.ts
export const getThrottlerConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return [
    {
      name: 'short',
      ttl: 1000,
      limit: isDevelopment ? 100 : 3, // Relaxed in development
    },
    {
      name: 'medium',
      ttl: 10000,
      limit: isDevelopment ? 200 : 20,
    },
    {
      name: 'long',
      ttl: 60000,
      limit: isDevelopment ? 1000 : 100,
    },
  ];
};
```

### Custom Throttler Guard

```typescript
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use user ID for authenticated requests
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }
    
    // Use IP for anonymous requests
    return req.ip;
  }
}
```

## Best Practices

1. **Use Different Limits for Different Endpoints**
   - Strict limits for authentication endpoints
   - Relaxed limits for read operations
   - Medium limits for write operations

2. **Skip Rate Limiting for Health Checks**
   - Health endpoints should not be rate-limited
   - Monitoring endpoints should be accessible

3. **Provide Clear Error Messages**
   - Tell users when they can retry
   - Explain the rate limit policy

4. **Consider User Context**
   - Authenticated users may have higher limits
   - Premium users may have even higher limits

5. **Monitor Rate Limit Hits**
   - Log when users hit rate limits
   - Alert on suspicious patterns

6. **Use Redis in Production**
   - In-memory storage doesn't work with multiple instances
   - Redis provides distributed rate limiting

## Monitoring

### Log Rate Limit Hits

```typescript
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerExceptionFilter.name);

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    
    // Log rate limit hit
    this.logger.warn(
      `Rate limit exceeded: ${request.method} ${request.url} - IP: ${request.ip}`
    );
    
    // Send response...
  }
}
```

## Troubleshooting

### Rate limits not working
- Ensure ThrottlerModule is imported in AppModule
- Verify ThrottlerGuard is registered as APP_GUARD
- Check that endpoints aren't using @SkipThrottle()

### Different limits per environment
- Use environment variables for configuration
- Consider different configs for dev/staging/prod

### Rate limits too strict/lenient
- Adjust limits in app.module.ts
- Consider user feedback and usage patterns
- Monitor actual API usage

## Related Documentation

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
