import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Example controller demonstrating rate limiting usage
 */
@ApiTags('Examples')
@Controller('examples')
export class ExamplesController {
  /**
   * Example 1: Default rate limiting
   * Uses the global rate limit configuration
   */
  @Get('default')
  @ApiOperation({ summary: 'Endpoint with default rate limiting' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  getWithDefaultLimit() {
    return {
      message: 'This endpoint uses default rate limiting',
      limits: {
        short: '3 requests per second',
        medium: '20 requests per 10 seconds',
        long: '100 requests per minute',
      },
    };
  }

  /**
   * Example 2: No rate limiting
   * Use @SkipThrottle() for public or health check endpoints
   */
  @SkipThrottle()
  @Get('public')
  @ApiOperation({ summary: 'Public endpoint without rate limiting' })
  @ApiResponse({ status: 200, description: 'Success' })
  getPublic() {
    return {
      message: 'This endpoint has no rate limiting',
      note: 'Use @SkipThrottle() for health checks and public endpoints',
    };
  }

  /**
   * Example 3: Custom strict rate limit
   * Perfect for sensitive endpoints like login
   */
  @Throttle({ limit: 5, ttl: 60000 })
  @Post('login')
  @ApiOperation({ summary: 'Login with strict rate limiting' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - 5 per minute' })
  login(@Body() credentials: any) {
    return {
      message: 'Login endpoint with strict limit',
      limit: '5 requests per minute',
      note: 'Use @Throttle({ limit: 5, ttl: 60000 })',
    };
  }

  /**
   * Example 4: Relaxed rate limit
   * For endpoints that need higher throughput
   */
  @Throttle({ limit: 1000, ttl: 60000 })
  @Get('search')
  @ApiOperation({ summary: 'Search with relaxed rate limiting' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - 1000 per minute',
  })
  search() {
    return {
      message: 'Search endpoint with relaxed limit',
      limit: '1000 requests per minute',
      note: 'Use @Throttle({ limit: 1000, ttl: 60000 })',
    };
  }

  /**
   * Example 5: Very strict rate limit
   * For dangerous operations like password reset
   */
  @Throttle({ limit: 3, ttl: 300000 })
  @Post('reset-password')
  @ApiOperation({ summary: 'Password reset with very strict rate limiting' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - 3 per 5 minutes',
  })
  resetPassword(@Body() email: any) {
    return {
      message: 'Password reset with very strict limit',
      limit: '3 requests per 5 minutes',
      note: 'Use @Throttle({ limit: 3, ttl: 300000 })',
    };
  }

  /**
   * Example 6: Short-term burst protection
   * Prevents rapid-fire requests
   */
  @Throttle({ limit: 10, ttl: 1000 })
  @Post('vote')
  @ApiOperation({ summary: 'Voting with burst protection' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 429, description: 'Too Many Requests - 10 per second' })
  vote(@Body() vote: any) {
    return {
      message: 'Vote endpoint with burst protection',
      limit: '10 requests per second',
      note: 'Use @Throttle({ limit: 10, ttl: 1000 })',
    };
  }

  /**
   * Example 7: Rate limit info endpoint
   * Shows current rate limit configuration
   */
  @SkipThrottle()
  @Get('rate-limit-info')
  @ApiOperation({ summary: 'Get rate limit information' })
  @ApiResponse({ status: 200, description: 'Rate limit configuration' })
  getRateLimitInfo() {
    return {
      globalLimits: {
        short: {
          duration: '1 second',
          limit: 3,
          description: 'Anti-spam protection',
        },
        medium: {
          duration: '10 seconds',
          limit: 20,
          description: 'General API usage',
        },
        long: {
          duration: '1 minute',
          limit: 100,
          description: 'Overall usage limit',
        },
      },
      customLimits: {
        login: '5 requests per minute',
        resetPassword: '3 requests per 5 minutes',
        search: '1000 requests per minute',
        vote: '10 requests per second',
      },
      responseFormat: {
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        error: 'Rate Limit Exceeded',
        headers: [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
          'Retry-After',
        ],
      },
    };
  }
}
