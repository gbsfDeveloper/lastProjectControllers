import { NextFunction, Request, Response } from 'express';

import { config } from '../config';
import { ErrorMessage } from '../lib/errors/errorMessages';
import ValidationError from '../lib/errors/ValidationError';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import ParentService from '../services/parent.service';

interface ParentUsernameRequest extends Request {
  body: { username: string };
}

export const parentUsername = async (
  req: ParentUsernameRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.body;

    if (typeof username !== 'string') {
      throw new ValidationError(ErrorMessage.INVALID_USERNAME);
    }

    if (username.length > 200) {
      throw new ValidationError(ErrorMessage.USERNAME_TOO_LONG);
    }

    await ParentService.updateUsername(req.user.id, username);

    // METALOG - PARENT_UPDATE_ONLY_USERNAME
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      req.user.id,
      MetalogSections.PARENT_UPDATE_ONLY_USERNAME,
      `El padre actualizo su username a: ${username}`
    );

    res.status(204).json(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
};

export const parentPaymentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentHistorical = await ParentService.paymentHistory(req.user.id);

    res.json({ paymentHistorical });
  } catch (error) {
    next(error);
  }
};
