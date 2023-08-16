import { Types } from 'mongoose';

import { StudentModel } from '../../models';

export const getDashboardHeadOfDisplay = async (parentId: Types.ObjectId) => {
  const students = await StudentModel.find(
    { parentId },
    'avatar username streak.mon streak.tue streak.wed streak.thu streak.fri'
  )
    .lean()
    .exec();

  return students.length
    ? students.map(
        (student) =>
          student && {
            avatar: student.avatar,
            username: student.username,
            streak: student.streak
              ? Object.values(student.streak)
              : new Array(5).fill(false),
          }
      )
    : [];
};
