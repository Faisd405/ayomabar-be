import { AllExceptionsFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
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

  it('should catch HttpException and return proper error response', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        path: '/api/v1/test',
        method: 'GET',
      }),
    );
  });

  it('should catch HttpException with object message', () => {
    const exception = new HttpException(
      { message: 'Validation failed', errors: ['error1', 'error2'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/api/v1/test',
        method: 'GET',
      }),
    );
  });

  it('should catch unknown exceptions and return 500', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/api/v1/test',
        method: 'GET',
      }),
    );
  });

  it('should include timestamp in error response', () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
      }),
    );
  });
});
