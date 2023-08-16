import { Types } from 'mongoose';

import { studentUserNotFound } from '../../lib/errors';
import { HeadOfDisplay, StudentModel } from '../../models';

export const getHeadOfDisplay = async (studentId: Types.ObjectId) => {
  const student: HeadOfDisplay =
    (await StudentModel.findById(studentId)
      .select(
        'avatar username streak.mon streak.tue streak.wed streak.thu streak.fri'
      )
      .lean()
      .exec()) ?? studentUserNotFound();

  return student;
};
