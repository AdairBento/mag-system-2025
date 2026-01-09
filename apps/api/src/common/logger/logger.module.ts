import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { singleLine: true, translateTime: 'SYS:standard' },
              }
            : undefined,
        customProps: (req) => ({ requestId: (req as any).requestId }),
      },
    }),
  ],
})
export class LoggerModule {}
