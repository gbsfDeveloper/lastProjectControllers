import { compare } from 'bcrypt';
import { Types } from 'mongoose';

import { ParentModel } from '../../models/parent.model';

export const findParentWithEmail = (email?: string) => {
  return ParentModel.findOne({ email }).select(
    'password students email isEmailVerified username'
  );
};

export const findParentWithId = (id: Types.ObjectId) => {
  return ParentModel.findById(id)
    .select('email isEmailVerified userFullName')
    .lean()
    .exec();
};

export const comparePasswords = (
  plainTextPassword: string,
  hashedPassword: string
) => {
  return compare(plainTextPassword, hashedPassword);
};

export const findParentWithFirebaseUID = (uid: string) => {
  return ParentModel.findOne({ uid }).select('_id').lean().exec();
};
