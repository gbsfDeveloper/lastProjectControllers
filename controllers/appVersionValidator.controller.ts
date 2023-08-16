import { NextFunction, Request, Response } from 'express';

import { functionGetValidVersion } from '../services/appVersionValidator';

interface AppVersion extends Request {
  body: { appVersion: string };
}

export const appVersionValidator = async (
  req: AppVersion,
  res: Response,
  next: NextFunction
) => {
  try {
    const validVersions = await functionGetValidVersion();
    if (validVersions) {
      return res.status(200).json({
        validVersion: validVersions.validVersions.includes(req.body.appVersion)
          ? true
          : false,
      });
    }
    return res.status(200).json({ validVersion: false });
  } catch (error) {
    next(error);
  }
};
