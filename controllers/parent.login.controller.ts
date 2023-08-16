import { NextFunction, Request, Response } from 'express';
import { auth } from 'firebase-admin';
import { LeanDocument, Types } from 'mongoose';
import isEmail from 'validator/lib/isEmail';

import { ErrorMessage, parentUserNotFound } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import {
  generateAccessToken,
  TokenParams,
} from '../lib/helpers/generateAccessToken';
import { UserTypes } from '../middlewares/authentication';
import { Parent } from '../models';
import {
  comparePasswords,
  findParentWithEmail,
  findParentWithFirebaseUID,
} from '../services/accessManagement';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import ParentService from '../services/parent.service';
import { StudentAccessTokens } from '../types/Login';

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const login = async (
  req: LoginRequest,
  res: Response,
  next: NextFunction
) => {
  // DEPLOY TO PROD - DELETE
  try {
    const { email, password } = req.body;

    if (!isEmail(email)) {
      throw new ValidationError(ErrorMessage.INVALID_CREDENTIALS);
    }

    const parent = (await findParentWithEmail(email)) ?? parentUserNotFound();

    // TRACKING
    await ParentService.updateLoginTraking(parent._id);

    if (!parent.password || typeof password !== 'string') {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} password`
      );
    }

    const isValid = await comparePasswords(password, parent.password);

    if (!isValid) {
      throw new ValidationError(ErrorMessage.INVALID_CREDENTIALS, 401);
    }

    const { accessToken, studentAccessTokens } =
      generateParentLoginTokens(parent);

    // METALOG - PARENT_LOGIN
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parent._id,
      MetalogSections.PARENT_LOGIN,
      `El padre con el email: ${
        parent.email
      } con el id: ${parent._id.toString()} entro a la aplicacion -login-`
    );

    res.status(200).json({
      accessToken,
      studentAccessTokens,
      userInfo: {
        email: parent.email,
        isEmailVerified: parent.isEmailVerified,
        username: parent.username ? parent.username : parent.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

interface LoginThirdPartyRequest extends Request {
  body: {
    idToken: string;
  };
}

export const loginThirdPartyController = async (
  req: LoginThirdPartyRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken } = req.body;

    const { uid } = await auth().verifyIdToken(idToken);

    const parent =
      (await findParentWithFirebaseUID(uid)) ?? parentUserNotFound();

    const { accessToken, studentAccessTokens } =
      generateParentLoginTokens(parent);

    res.status(200).json({ accessToken, studentAccessTokens });
  } catch (error) {
    next(error);
  }
};

export function generateParentLoginTokens(parent: LeanDocument<Parent>) {
  const token: TokenParams = { id: parent._id, userType: UserTypes.PARENT };

  const accessToken = generateAccessToken(token);

  const students: Array<Types.ObjectId> = parent.students;

  let studentAccessTokens: StudentAccessTokens = students.map((student) => {
    return generateAccessToken({ id: student, userType: UserTypes.STUDENT });
  });

  studentAccessTokens = studentAccessTokens.slice(0, 3);

  return {
    accessToken,
    studentAccessTokens,
  };
}
