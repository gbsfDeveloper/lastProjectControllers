import cors from 'cors';
import { NextFunction, Request, Response } from 'express';

import { config } from '../config';
const isDevelopment = config.NODE_ENV !== 'production';

export const corsOnDev = isDevelopment
  ? cors()
  : (_req: Request, _res: Response, next: NextFunction) => next();
