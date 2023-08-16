import { UserInfoInToken } from '../middlewares/authentication';

export type UserInRequest = UserInfoInToken & {
  isPremium: boolean;
};

export enum AppOriginTypes {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

declare global {
  namespace Express {
    interface Request {
      user: UserInRequest;
      appType: `${AppOriginTypes}`;
    }
  }
}
