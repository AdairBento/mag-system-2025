import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { ApiResponse } from '@mag/shared';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<any>> {
    const req = context.switchToHttp().getRequest();
    const requestId = req?.requestId ?? 'unknown';

    return next.handle().pipe(
      map((data) => ({
        data: data ?? null,
        requestId,
      })),
    );
  }
}
