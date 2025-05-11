import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.userId || 'anonymous';

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${response.statusCode} [${delay}ms] - User: ${userId} - UA: ${userAgent}`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;

          this.logger.error(
            `${method} ${url} ${error.status} [${delay}ms] - User: ${userId} - UA: ${userAgent} - Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
