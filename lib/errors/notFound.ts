import { ErrorMessage } from './errorMessages';
import ValidationError from './ValidationError';

export function parentUserNotFound(): never {
  throw new ValidationError(ErrorMessage.PARENT_NOT_FOUND, 401);
}

export function studentUserNotFound(): never {
  throw new ValidationError(ErrorMessage.STUDENT_NOT_FOUND, 401);
}

export function noRecordFound(recordType: string): never {
  throw new ValidationError(
    `${ErrorMessage.RECORD_NOT_FOUND} ${recordType}`,
    404
  );
}
