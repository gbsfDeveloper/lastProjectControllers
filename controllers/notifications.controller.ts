import { NextFunction, Request, Response } from 'express';

import { config } from '../config';
import { ErrorMessage } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import ParentService from '../services/parent.service';

interface NotificationsRequest extends Request {
  body: {
    notifications: boolean;
  };
}

export const setNotificationsStatus = async (
  req: NotificationsRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notifications } = req.body;

    if (typeof notifications !== 'boolean') {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} notifications`
      );
    }

    await ParentService.updateNotification(req.user.id, notifications);

    res.status(204).json(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
};
