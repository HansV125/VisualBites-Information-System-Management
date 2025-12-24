import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger('AuditLog');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url, body, cookies } = request;

        // Only log mutating operations
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const userId = cookies?.jwt ? 'authenticated' : 'anonymous';
        const timestamp = new Date().toISOString();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    // Log successful mutation
                    this.logger.log(
                        JSON.stringify({
                            timestamp,
                            action: method,
                            path: url,
                            userId,
                            success: true,
                            resourceId: data?.id || data?.[0]?.id || 'N/A',
                        })
                    );
                },
                error: (error) => {
                    // Log failed mutation
                    this.logger.warn(
                        JSON.stringify({
                            timestamp,
                            action: method,
                            path: url,
                            userId,
                            success: false,
                            error: error.message,
                        })
                    );
                },
            }),
        );
    }
}
