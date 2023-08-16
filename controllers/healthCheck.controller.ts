import { NextFunction, Request, Response } from 'express';

function launchHealthCheck(_req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).send({ message: 'ok' });
  } catch (error) {
    next(error);
  }
}

export { launchHealthCheck };
