import { hash } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isStrongPassword from 'validator/lib/isStrongPassword';

import { config } from '../config';
import { ErrorMessage } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import { StudentsInfo } from '../models';
import HubspotService from '../services/hubspot.service';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import ParentService from '../services/parent.service';
import { UpdateParentInfoProps } from '../types/Hubspot';

interface ParentUsernameBody {
  userFullName?: string;
  userNames?: string;
  userLastNames?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  username?: string;
  numberOfKids?: number;
  studentsInfo?: StudentsInfo[];
}

export const parentUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //DEPLOY
    const body = req.body as ParentUsernameBody;
    const {
      username,
      email,
      numberOfKids,
      userFullName,
      password,
      studentsInfo,
      userNames,
      userLastNames,
    } = body;

    const { phoneNumber } = body as { phoneNumber: string };

    const parentId = req.user.id;

    if (
      existProperty(body, 'phoneNumber') &&
      !isMobilePhone(phoneNumber.replaceAll(/\s/g, ''), ['es-MX', 'en-US'])
    ) {
      throw new ValidationError(ErrorMessage.INVALID_PHONE_NUMBER);
    }

    if (
      existProperty(body, 'userFullName') &&
      typeof userFullName !== 'string'
    ) {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} userFullName`
      );
    }

    if (
      existProperty(body, 'numberOfKids') &&
      typeof numberOfKids !== 'number'
    ) {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} numberOfKids`
      );
    }

    if (existProperty(body, 'username') && typeof username !== 'string') {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} username`
      );
    }

    if (
      existProperty(body, 'password') &&
      (typeof password !== 'string' || !isStrongPassword(password))
    ) {
      throw new ValidationError(ErrorMessage.PASSWORD_NOT_STRONG);
    }

    if (existProperty(body, 'userNames') && typeof userNames !== 'string') {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} userNames`
      );
    }

    if (
      existProperty(body, 'userLastNames') &&
      typeof userLastNames !== 'string'
    ) {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} userLastNames`
      );
    }

    validateStudentsInfo(body, studentsInfo);

    validateMail(body, email);

    let hashedPassword = password
      ? await hash(password, config.SALT_ROUNDS)
      : null;

    hashedPassword = null;

    const profileUpdate = {
      username,
      email,
      numberOfKids,
      phoneNumber,
      userNames,
      userFullName,
      userLastNames,
      studentsInfo,
    };

    // if there is a hashedPassword present, update the password property
    if (hashedPassword) {
      await ParentService.updateParentProfile(parentId, {
        ...profileUpdate,
        password: hashedPassword,
      });
    } else {
      await ParentService.updateParentProfile(parentId, profileUpdate);
    }

    if (email) {
      if (config.NODE_ENV !== 'development') {
        // HUBSPOT
        const hubspotUpdateInfo: UpdateParentInfoProps = {
          email,
          firstname: userNames,
          lastname: userLastNames,
        };
        HubspotService.getParentHubspotInfo(hubspotUpdateInfo);
      }
    }

    // METALOG - PARENT_UPDATE_PROFILE
    if (body.password) {
      delete body.password;
    }
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parentId,
      MetalogSections.PARENT_UPDATE_PROFILE,
      `El padre actualizo su informacion de perfil con:${JSON.stringify(body)}`
    );

    res.status(204).json(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
};

const validateMail = (
  body: ParentUsernameBody,
  email: string | undefined
): void => {
  if (
    existProperty(body, 'email') &&
    (typeof email !== 'string' || !isEmail(email))
  ) {
    throw new ValidationError(ErrorMessage.INVALID_EMAIL);
  }
};

const existProperty = (
  object: ParentUsernameBody | StudentsInfo,
  key: keyof ParentUsernameBody | keyof StudentsInfo
): boolean => {
  return Object.prototype.hasOwnProperty.call(object, key);
};

export const parentGetProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;

    const profileFound = (await ParentService.findParentByIdGetProfileProps(
      parentId
    )) as ParentUsernameBody;

    // password will always be sent empty
    const profileDefaultResponse = {
      username: '',
      numberOfKids: 0,
      phoneNumber: '',
      userFullName: '',
      password: '',
      userNames: '',
      userLastNames: '',
      ...profileFound,
    };

    // METALOG - PARENT_GET_PROFILE
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parentId,
      MetalogSections.PARENT_GET_PROFILE,
      `El padre entro a la seccion -profile-`
    );

    res.status(200).json(profileDefaultResponse);
  } catch (error) {
    next(error);
  }
};

function validateStudentsInfo(
  body: ParentUsernameBody,
  studentsInfo: StudentsInfo[] | undefined
) {
  if (existProperty(body, 'studentsInfo')) {
    if (!Array.isArray(studentsInfo)) {
      throw new Error(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} studentsInfo, must be an array`
      );
    }

    studentsInfo.forEach((info) => {
      if (existProperty(info, 'grading') && typeof info.grading !== 'string') {
        throw new ValidationError(
          `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} grading, must be an string`
        );
      }

      if (existProperty(info, 'age') && typeof info.age !== 'number') {
        throw new ValidationError(
          `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} age, must be an string`
        );
      }
    });
  }
}

interface ParentDailyTips {
  tipTitle: string;
  tipBody: string;
}

export const parentGetDailyTip = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ACTUAL DATE
    const todayDate = new Date().toISOString().split('T')[0];

    const parentDailyTipsFounded = await ParentService.findParentDailyTips(
      todayDate
    );

    let parentDailyTipsResponse: ParentDailyTips = {
      tipTitle: 'Tip del día',
      tipBody:
        'Jugar es un aprendizaje interminable, encantador, atractivo y práctico. Es la puerta al corazón del niño y las llaves del mundo futuro.',
    };

    if (parentDailyTipsFounded) {
      parentDailyTipsResponse = {
        tipBody: parentDailyTipsFounded.tipBody,
        tipTitle:
          parentDailyTipsFounded.tipTitle === ''
            ? 'Tip del día'
            : parentDailyTipsFounded.tipTitle,
      };
    }

    res.status(200).json(parentDailyTipsResponse);
  } catch (error) {
    next(error);
  }
};
