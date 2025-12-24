import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
    method: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string;
        let error: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            } else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse as any;
                message = resp.message || exception.message;
                error = resp.error || exception.name;
            } else {
                message = exception.message;
                error = exception.name;
            }
        } else if (exception instanceof Error) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';

            // Log the actual error for debugging
            this.logger.error(
                `Unhandled error: ${exception.message}`,
                exception.stack,
            );
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'An unexpected error occurred';
            error = 'UnknownError';
        }

        const errorResponse: ErrorResponse = {
            statusCode: status,
            message: Array.isArray(message) ? message.join(', ') : message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };

        // Log error details
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status} - ${message}`,
            );
        } else if (status >= 400) {
            this.logger.warn(
                `${request.method} ${request.url} - ${status} - ${message}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}
