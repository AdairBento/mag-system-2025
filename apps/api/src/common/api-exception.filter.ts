import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = isHttp ? exception.getResponse() : null;

    const payload =
      typeof response === 'string'
        ? { message: response }
        : ((response as Record<string, any>) ?? {
            message: 'Internal server error',
          });

    const code = payload.code ?? (isHttp ? 'HTTP_ERROR' : 'INTERNAL_ERROR');
    const message = payload.message ?? 'Erro inesperado';

    return res.status(status).json({
      ok: false,
      status,
      code,
      message,
      details: payload,
    });
  }
}
