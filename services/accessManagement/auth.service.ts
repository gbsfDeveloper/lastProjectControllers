import { Request } from 'express';
import { verify } from 'jsonwebtoken';

import { config } from '../../config';
import {
  ErrorMessage,
  parentUserNotFound,
  studentUserNotFound,
} from '../../lib/errors';
import ValidationError from '../../lib/errors/ValidationError';
import { UserInfoInToken } from '../../middlewares/authentication';
import { ParentModel, StudentModel, SubscriptionStatus } from '../../models';

const { AUTH_SECRET } = config;

export const authUserIsPremium = async (
  id: UserInfoInToken['id'],
  userType: UserInfoInToken['userType']
) => {
  let student = null;

  if (userType === 'STUDENT') {
    student =
      (await StudentModel.findById(id).select('parentId').lean().exec()) ??
      studentUserNotFound();

    if (!student.parentId) {
      return false;
    }
  }

  const parentId = student ? student.parentId : id;

  const parent =
    (await ParentModel.findById(parentId).select('subscription').exec()) ??
    parentUserNotFound();

  if (!parent.subscription) {
    throw new Error(ErrorMessage.SUBSCRIPTION_NOT_FOUND);
  }

  const isPremiumSubscription =
    parent.subscription.status === SubscriptionStatus.PREMIUM ||
    parent.subscription.status === SubscriptionStatus.TRIAL;

  return isPremiumSubscription;
};

export const decodeTokenFromHeader = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) throw new ValidationError(ErrorMessage.AUTH_TOKEN_MISSING, 401);

  return decodeToken(token);
};

export const decodeToken = (token: string) => {
  if (!AUTH_SECRET) throw new Error(ErrorMessage.AUTH_SECRET_MISSING);

  return verify(token, AUTH_SECRET) as UserInfoInToken;
};
