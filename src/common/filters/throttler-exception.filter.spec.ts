import { ThrottlerExceptionFilter } from './throttler-exception.filter';
import { ThrottlerException } from '@nestjs/throttler';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('ThrottlerExceptionFilter', () => {
  let filter: ThrottlerExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    filter = new ThrottlerExceptionFilter();

    mockRequest = {
      url: '/api/v1/users',
      method: 'GET',
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch ThrottlerException and return 429 status', () => {
    const exception = new ThrottlerException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });

  it('should return proper error response format', () => {
    const exception = new ThrottlerException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please try again later.',
        error: 'Rate Limit Exceeded',
        path: '/api/v1/users',
        method: 'GET',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should include request details in response', () => {
    const exception = new ThrottlerException();

    filter.catch(exception, mockArgumentsHost);

    const response = mockResponse.json.mock.calls[0][0];

    expect(response.path).toBe('/api/v1/users');
    expect(response.method).toBe('GET');
  });

  it('should include ISO timestamp in response', () => {
    const exception = new ThrottlerException();

    filter.catch(exception, mockArgumentsHost);

    const response = mockResponse.json.mock.calls[0][0];
    const timestamp = new Date(response.timestamp);

    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toISOString()).toBe(response.timestamp);
  });
});
