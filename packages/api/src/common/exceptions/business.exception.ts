import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, cause?: string) {
    super(
      {
        message,
        cause: cause || 'Business rule violation',
        error: 'BusinessException',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    super(
      {
        message: `${resource} not found${id ? ` with id: ${id}` : ''}`,
        error: 'NotFoundException',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized access') {
    super(
      {
        message,
        error: 'UnauthorizedException',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Access forbidden') {
    super(
      {
        message,
        error: 'ForbiddenException',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
