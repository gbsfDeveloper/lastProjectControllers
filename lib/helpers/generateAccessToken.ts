import { sign } from 'jsonwebtoken';

import { config } from '../../config';
import {
  ResetPasswordInfoInToken,
  UserInfoInToken,
} from '../../middlewares/authentication';
import { ErrorMessage } from '../errors';

export type TokenParams = Pick<UserInfoInToken, 'id' | 'userType'>;
export type TokenResetPasswordParams = Pick<
  ResetPasswordInfoInToken,
  'id' | 'dueDate'
>;

export const generateAccessToken = (accessToken: TokenParams) => {
  if (!config.AUTH_SECRET) throw new Error(ErrorMessage.AUTH_SECRET_MISSING);

  return sign(accessToken, config.AUTH_SECRET);
};

export const generateResetAccessToken = (
  accessToken: TokenResetPasswordParams
) => {
  if (!config.AUTH_SECRET) throw new Error(ErrorMessage.AUTH_SECRET_MISSING);

  return sign(accessToken, config.AUTH_SECRET, {
    expiresIn: config.RESET_PASSWORD_EXPIRATION_TIME,
  });
};
