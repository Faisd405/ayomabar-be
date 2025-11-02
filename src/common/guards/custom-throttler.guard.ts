import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // Check if this is a Discord/Necord context
    const contextType = context.getType();
    
    // Skip throttling for non-HTTP contexts (like Discord bot interactions)
    if (contextType !== 'http') {
      return true;
    }

    // Get the handler
    const handler = context.getHandler();
    const className = context.getClass();

    // Skip if it's from Discord module
    if (className && className.name && className.name.includes('Commands')) {
      return true;
    }

    return false;
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    // Only process if it's an actual HTTP request
    if (!req || !req.ip) {
      return Promise.resolve('discord-bot');
    }
    return Promise.resolve(req.ip);
  }

  protected getRequestResponse(context: ExecutionContext) {
    // Only handle HTTP contexts
    const contextType = context.getType();
    if (contextType !== 'http') {
      // Return mock objects for non-HTTP contexts
      return {
        req: {},
        res: {
          header: () => {},
          status: () => ({ send: () => {} }),
        },
      };
    }

    return super.getRequestResponse(context);
  }
}
