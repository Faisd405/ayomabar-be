import { SetMetadata } from '@nestjs/common';

export const THROTTLE_LIMIT_KEY = 'throttle_limit';
export const THROTTLE_TTL_KEY = 'throttle_ttl';

export interface ThrottleOptions {
  limit: number;
  ttl: number; // in milliseconds
}

export const Throttle = (options: ThrottleOptions) => {
  return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    SetMetadata(THROTTLE_LIMIT_KEY, options.limit)(target, key, descriptor);
    SetMetadata(THROTTLE_TTL_KEY, options.ttl)(target, key, descriptor);
  };
};
