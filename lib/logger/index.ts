import { addColors, createLogger, format, transports } from 'winston';

import { config } from '../../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = config.NODE_ENV === 'development' ? 'debug' : 'http';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

addColors(colors);

interface TransformableInfo {
  timestamp?: string;
  level: string;
  message: string;
}

const logFormat = config.IS_LOCAL
  ? format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      format.colorize({ all: true }),
      format.printf(
        ({ timestamp, level: winstonLevel, message }: TransformableInfo) =>
          `${timestamp ? timestamp : ''} ${winstonLevel}: ${message}`
      )
    )
  : format.combine(
      format.printf(
        ({ level: winstonLevel, message }: TransformableInfo) =>
          `${winstonLevel}: ${message}`
      )
    );

const logTransports = [new transports.Console()];

export const logger = createLogger({
  level,
  levels,
  format: logFormat,
  transports: logTransports,
});
