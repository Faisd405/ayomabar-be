import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Check if this is an HTTP context
    const contextType = host.getType();
    
    // Only handle HTTP contexts, skip others (like Discord, WebSocket, etc.)
    if (contextType !== 'http') {
      this.logger.error('Non-HTTP exception caught', exception);
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Additional check to ensure response exists and has required methods
    if (!response || typeof response.status !== 'function') {
      this.logger.error('Invalid response object', exception);
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Extract error message
    let errorMessage: string | string[];
    if (typeof message === 'string') {
      errorMessage = message;
    } else if (typeof message === 'object' && message !== null) {
      errorMessage = (message as any).message || 'An error occurred';
    } else {
      errorMessage = 'An error occurred';
    }

    // Log the error
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
    };

    // Log error details
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorMessage)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
