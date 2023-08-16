import { isValidObjectId, Types } from 'mongoose';

import { ErrorMessage } from '../errors';
import ValidationError from '../errors/ValidationError';

export const validateMongoID = (
  id: string | Types.ObjectId,
  idType?: string
) => {
  if (!isValidObjectId(id)) {
    const _idType = idType ? `: ${idType}` : '';
    throw new ValidationError(`${ErrorMessage.INVALID_MONGO_ID}${_idType}`);
  }
};
