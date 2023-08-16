import { LessonModel } from '../../models';

export const getLessons = async () => {
  return LessonModel.find({ isActive: true })
    .limit(200)
    .sort({ lessonsNumber: 1 })
    .select('title firstPage lessonsNumber lastPage isGuest')
    .lean()
    .exec();
};
