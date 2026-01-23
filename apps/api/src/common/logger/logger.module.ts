import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ms }) => {
        return `[${timestamp}] [${level}] ${message} ${ms}`;
      }),
    ),
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
];

@Module({
  providers: [
    {
      provide: 'WINSTON_MODULE_PROVIDER',
      useValue: WinstonModule.createLogger({
        transports,
        exceptionHandlers: [
          new winston.transports.File({ filename: 'logs/exceptions.log' }),
        ],
        rejectionHandlers: [
          new winston.transports.File({ filename: 'logs/rejections.log' }),
        ],
      }),
    },
  ],
  exports: ['WINSTON_MODULE_PROVIDER'],
})
export class LoggerModule {}
