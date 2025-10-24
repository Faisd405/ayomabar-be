export const throttlerConfig = {
  // Short-term rate limit (anti-spam)
  short: {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 3, // 3 requests per second
  },
  
  // Medium-term rate limit (general API usage)
  medium: {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 20, // 20 requests per 10 seconds
  },
  
  // Long-term rate limit (hourly limit)
  long: {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
  
  // Strict rate limit (for sensitive endpoints like login)
  strict: {
    name: 'strict',
    ttl: 60000, // 1 minute
    limit: 5, // 5 requests per minute
  },
};

export const getRateLimitMessage = (limit: number, ttl: number): string => {
  const seconds = Math.floor(ttl / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `Too many requests. Limit: ${limit} requests per ${minutes} minute${minutes > 1 ? 's' : ''}.`;
  }
  return `Too many requests. Limit: ${limit} requests per ${seconds} second${seconds > 1 ? 's' : ''}.`;
};
