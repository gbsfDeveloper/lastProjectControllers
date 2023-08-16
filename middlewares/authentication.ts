import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import { Types } from 'mongoose';

import { ErrorMessage } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import {
  authUserIsPremium,
  decodeTokenFromHeader,
} from '../services/accessManagement';
import ParentService from '../services/parent.service';
import StudentService from '../services/student.service';

export enum UserTypes {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export type UserInfoInToken = {
  id: Types.ObjectId;
  userType: `${UserTypes}`;
  iat: number; // iat meaning "issued at".
};

export type ResetPasswordInfoInToken = {
  id: Types.ObjectId;
  dueDate: Date | DateTime;
};

export const authStudent = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const decodedUserInfo = decodeTokenFromHeader(req);

    if (decodedUserInfo.userType !== 'STUDENT') {
      throw new ValidationError(ErrorMessage.NOT_STUDENT_USER, 401);
    }

    const isPremium = await StudentService.isPremium(decodedUserInfo.id);

    req.user = {
      id: decodedUserInfo.id,
      userType: decodedUserInfo.userType,
      iat: decodedUserInfo.iat,
      isPremium,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const originAppIos = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    req.appType = 'IOS';
    next();
  } catch (error) {
    next(error);
  }
};

export const originAppAndroid = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    req.appType = 'ANDROID';
    next();
  } catch (error) {
    next(error);
  }
};

export const authParent = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const decodedUserInfo = decodeTokenFromHeader(req);

    if (decodedUserInfo.userType !== 'PARENT') {
      throw new ValidationError(ErrorMessage.NOT_PARENT_USER, 401);
    }

    const isPremium = await ParentService.isPremium(decodedUserInfo.id);

    req.user = {
      id: decodedUserInfo.id,
      userType: decodedUserInfo.userType,
      iat: decodedUserInfo.iat,
      isPremium,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const decodedUserInfo = decodeTokenFromHeader(req);

    const isPremium = await authUserIsPremium(
      decodedUserInfo.id,
      decodedUserInfo.userType
    );

    req.user = {
      id: decodedUserInfo.id,
      userType: decodedUserInfo.userType,
      iat: decodedUserInfo.iat,
      isPremium,
    };

    next();
  } catch (error) {
    next(error);
  }
};
