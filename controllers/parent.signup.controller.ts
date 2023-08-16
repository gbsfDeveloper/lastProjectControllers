import axios from 'axios';
import { hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { auth } from 'firebase-admin';
import { verify } from 'jsonwebtoken';
import { DateTime } from 'luxon';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isStrongPassword from 'validator/lib/isStrongPassword';

import { config } from '../config';
import { ErrorMessage, parentUserNotFound } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import {
  generateAccessToken,
  generateResetAccessToken,
} from '../lib/helpers/generateAccessToken';
import { logger } from '../lib/logger';
import {
  ResetPasswordInfoInToken,
  UserTypes,
} from '../middlewares/authentication';
import { SubscriptionCadence, SubscriptionPlatforms } from '../models';
import {
  findParentWithEmail,
  findParentWithFirebaseUID,
  signUpThirdParty,
  signUpWithUserAndPassword,
} from '../services/accessManagement';
import HubspotService from '../services/hubspot.service';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import MailService from '../services/mail/mail.service';
import parentService from '../services/parent.service';
import { functionGeneratePin } from '../services/validationMail';
import { generateParentLoginTokens } from './parent.login.controller';
const { AUTH_SECRET } = config;
const { mail } = config;
const subject = mail.typeOfEmail.resetPasswordEmail.subject;
const template = mail.typeOfEmail.resetPasswordEmail.template;
const pinSubject = mail.typeOfEmail.pinEmail.subject;
const pinTemplate = mail.typeOfEmail.pinEmail.template;

export interface SignupProps {
  email: string;
  password: string;
  isTermsAndConditionsAccepted: boolean;
  phoneNumber?: string;
  username?: string;
  numberOfKids?: number;
  userNames?: string;
  userLastNames?: string;
}

interface SignupRequest extends Request {
  body: SignupProps;
}

export const signup = async (
  req: SignupRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, isTermsAndConditionsAccepted } = req.body;
    let { phoneNumber, username, numberOfKids, userNames, userLastNames } =
      req.body;

    if (
      !isTermsAndConditionsAccepted ||
      typeof isTermsAndConditionsAccepted !== 'boolean'
    ) {
      throw new ValidationError(ErrorMessage.TERMS_AND_CONDITIONS_NOT_ACCEPTED);
    }

    if (!isEmail(email)) {
      throw new ValidationError(ErrorMessage.INVALID_EMAIL);
    }

    if (phoneNumber) {
      phoneNumber = phoneNumber.replaceAll(/\s/g, '');
      if (!isMobilePhone(phoneNumber, ['es-MX', 'en-US'])) {
        throw new ValidationError(ErrorMessage.INVALID_PHONE_NUMBER);
      }
    }

    // Current options for strong password:
    // {
    //    minLength: 6,
    //    minLowercase: 1,
    //    minUppercase: 1,
    //    minNumbers: 1,
    //    minSymbols: 1,
    //    returnScore: false,
    //    pointsPerUnique: 1,
    //    pointsPerRepeat: 0.5,
    //    pointsForContainingLower: 10,
    //    pointsForContainingUpper: 10,
    //    pointsForContainingNumber: 10,
    //    pointsForContainingSymbol: 10
    // }

    if (!isStrongPassword(password, { minLength: 6, minSymbols: 0 })) {
      throw new ValidationError(ErrorMessage.PASSWORD_NOT_STRONG);
    }

    if (!username || typeof username !== 'string') {
      username = email.split('@')[0];
    }

    if (numberOfKids && typeof numberOfKids !== 'number') {
      numberOfKids = 0;
    }

    if (userNames && typeof userNames !== 'string') {
      userNames = '';
    }

    if (userLastNames && typeof userLastNames !== 'string') {
      userLastNames = '';
    }

    // Let's try to find the email to verify it doesn't exist.
    const parentInDB = await findParentWithEmail(email);
    // Let's try to find the username to verify it doesn't exist.
    const usernameInDB = await parentService.findParentInfoWithUsername(
      username
    );

    // If parent is different than null means that the email is already in our database, let's not sign the user up again.
    if (parentInDB) {
      throw new ValidationError(ErrorMessage.EMAIL_ALREADY_REGISTER);
    }

    if (usernameInDB) {
      throw new ValidationError(ErrorMessage.USERNAME_ALREADY_REGISTER);
    }

    const hashedPassword = await hash(password, config.SALT_ROUNDS);

    const parent = await signUpWithUserAndPassword({
      email,
      password: hashedPassword,
      isTermsAndConditionsAccepted,
      phoneNumber,
      username,
      numberOfKids,
      userNames,
      userLastNames,
    });

    const accessToken = generateAccessToken({
      id: parent._id,
      userType: UserTypes.PARENT,
    });

    const pin = await functionGeneratePin(parent._id);

    let isEmailPinSent = false;
    try {
      isEmailPinSent = MailService.SendMail(
        mail.EMAIL_VERIFICATION_ADDRESS,
        parent.email,
        pin,
        pinSubject,
        pinTemplate
      );
    } catch (error) {
      logger.error(ErrorMessage.AWS_SEND_MAIL);
      isEmailPinSent = false;
    }

    // HUBSPOT
    if (config.NODE_ENV !== 'development') {
      HubspotService.registerParent({
        email: parent.email,
        first_name: '',
        last_name: '',
        parent_id: parent._id.toString(),
      });
    }

    // METALOG - PARENT_UPDATE_PROFILE
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parent._id,
      MetalogSections.PARENT_UPDATE_PROFILE,
      `Un padre se registro con el ID: ${parent._id.toString()}`
    );

    res.status(200).json({
      accessToken,
      isEmailPinSent,
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

export interface SignupThirdPartyProps {
  idToken: string;
  isTermsAndConditionsAccepted: boolean;
  subscriptionCadence: `${SubscriptionCadence}`;
  subscriptionPlatform: `${SubscriptionPlatforms}`;
}

interface SignupThirdPartyRequest extends Request {
  body: SignupThirdPartyProps;
}

export const singUpThirdPartyController = async (
  req: SignupThirdPartyRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idToken, isTermsAndConditionsAccepted } = req.body;

    if (
      !isTermsAndConditionsAccepted ||
      typeof isTermsAndConditionsAccepted !== 'boolean'
    ) {
      throw new ValidationError(ErrorMessage.TERMS_AND_CONDITIONS_NOT_ACCEPTED);
    }

    const firebaseUser = await auth().verifyIdToken(idToken);

    const parentEmail =
      firebaseUser.email?.toLowerCase() ||
      `firebase_${firebaseUser.uid}@testmax.mx`.toLowerCase();

    const foundParentByUID = await findParentWithFirebaseUID(firebaseUser.uid);

    // A user with this UID is in our DB
    if (foundParentByUID) {
      const loggedInParentByUID = generateParentLoginTokens(foundParentByUID);

      res.status(200).json(loggedInParentByUID);
      return;
    }

    const foundParentByEmail = await findParentWithEmail(parentEmail);

    // Email is already in our DB
    if (foundParentByEmail) {
      foundParentByEmail.uid = firebaseUser.uid;
      await foundParentByEmail.save();

      const loggedInParentByEmail =
        generateParentLoginTokens(foundParentByEmail);

      res.status(200).json(loggedInParentByEmail);
      return;
    }

    // If the code reaches this point it means that not the email nor the uid is stored in our DB.
    // We can safely create a new parent.

    const parent = await signUpThirdParty({
      email: parentEmail,
      isTermsAndConditionsAccepted,
      firebaseUid: firebaseUser.uid,
    });

    const loggedInParent = generateParentLoginTokens(parent);

    res.status(200).json(loggedInParent);
  } catch (error) {
    next(error);
  }
};

interface RpResponse {
  kind: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  isNewUser: boolean;
}

interface IdTokenRequestParams {
  uid: string;
}

interface IdTokenRequest extends Request {
  body: IdTokenRequestParams;
}

export const getIdToken = async (
  req: IdTokenRequest,
  res: Response,
  _next: NextFunction
) => {
  const { uid } = req.params;

  const { firebase } = config;

  const customToken = await auth().createCustomToken(uid);

  const {
    data: { idToken, refreshToken, expiresIn },
  } = await axios.post<RpResponse>(
    'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken',
    {
      token: customToken,
      returnSecureToken: true,
    },
    {
      params: {
        key: firebase.APP_KEY,
      },
    }
  );

  res.status(200).json({
    idToken,
    refreshToken,
    expiresIn,
  });
};

interface SendResetPasswordRequest extends Request {
  body: {
    email: string;
    url: string;
  };
}

export const sendResetPasswordLink = async (
  req: SendResetPasswordRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, url } = req.body;

    const parentData =
      (await findParentWithEmail(email)) ?? parentUserNotFound();

    const token = generateResetAccessToken({
      id: parentData._id,
      dueDate: DateTime.now().toISODate() as unknown as DateTime,
    });

    const link = `${url}?token=${token}`;

    const isEmailSent = await MailService.SendResetPasswordMail(
      mail.EMAIL_VERIFICATION_ADDRESS,
      email,
      link,
      subject,
      template
    );

    res.send({
      message: mail.RESET_EMAIL_MESSAGE,
      isEmailSent,
    });
  } catch (error) {
    next(error);
  }
};

interface ResetPasswordRequest extends Request {
  body: {
    password: string;
  };
}

export const resetPassword = async (
  req: ResetPasswordRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenData = decodeResetToken(token);

    if (!isStrongPassword(password, { minLength: 6, minSymbols: 0 })) {
      throw new ValidationError(ErrorMessage.PASSWORD_NOT_STRONG);
    }

    const hashedPassword = await hash(password, config.SALT_ROUNDS);

    await parentService.updatePasswordParent(tokenData.id, hashedPassword);

    res.status(200).json({
      isPasswordRested: true,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetPasswordToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    // Token expires after 15 minutes
    // If expired it will throw an error
    decodeResetToken(token);

    res.status(200).json({
      token,
      isTokenValid: true,
    });
  } catch (error) {
    next(error);
  }
};

export const resendValidationPin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;

    const pin = await functionGeneratePin(parentId);
    const parentInfo = await parentService.findParentEmailWithId(parentId);
    let isEmailPinSent = false;
    if (parentInfo) {
      try {
        isEmailPinSent = MailService.SendMail(
          mail.EMAIL_VERIFICATION_ADDRESS,
          parentInfo.email,
          pin,
          pinSubject,
          pinTemplate
        );
      } catch (error) {
        logger.error(ErrorMessage.AWS_SEND_MAIL);
        isEmailPinSent = false;
      }
    }

    res.status(200).json({
      isEmailPinSent,
    });
  } catch (error) {
    next(error);
  }
};

function decodeResetToken(token: string) {
  try {
    if (!token) throw new Error(ErrorMessage.AUTH_TOKEN_MISSING);
    if (!AUTH_SECRET) throw new Error(ErrorMessage.AUTH_SECRET_MISSING);
    return verify(token, AUTH_SECRET) as ResetPasswordInfoInToken;
  } catch (error) {
    throw new ValidationError(ErrorMessage.AUTH_TOKEN_EXPIRED);
  }
}
