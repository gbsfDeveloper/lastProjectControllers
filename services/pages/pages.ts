import { LeanDocument } from 'mongoose';

import { config } from '../../config';
import { ErrorMessage, noRecordFound } from '../../lib/errors';
import { validateMongoID } from '../../lib/helpers/validateMongoID';
import { LessonModel, Page, PageModel } from '../../models';

export const getPagesFromLesson = async (lessonId: string) => {
  validateMongoID(lessonId, 'lessonId');

  const lesson =
    (await LessonModel.findById(lessonId)
      .select('lessonsNumber pagesId')
      .lean()
      .exec()) ?? noRecordFound('lesson');

  const previousLesson = await LessonModel.findOne({
    lessonsNumber: lesson.lessonsNumber - 1,
  })
    .select('_id')
    .lean()
    .exec();

  const nextLesson = await LessonModel.findOne({
    lessonsNumber: lesson.lessonsNumber + 1,
  })
    .select('_id')
    .lean()
    .exec();

  const pages: LeanDocument<Page>[] = await PageModel.find({
    _id: { $in: lesson.pagesId },
  })
    .select('pageNumber problem')
    .sort({ pageNumber: 1 })
    .lean()
    .exec();

  const newPages = pages.map((onePage) => {
    onePage.problem = onePage.problem.map((oneProblem) => {
      oneProblem.problemImage =
        oneProblem.problemImage && oneProblem.problemImage != ''
          ? `${config.CDN_URL}${oneProblem.problemImage}`
          : '';

      oneProblem.answer = oneProblem.answer.map((oneAnswer) => {
        oneAnswer.answerImage =
          oneAnswer.answerImage && oneAnswer.answerImage != ''
            ? `${config.CDN_URL}${oneAnswer.answerImage}`
            : '';
        return oneAnswer;
      });

      return oneProblem;
    });
    return onePage;
  });

  if (!pages || !pages.length) {
    throw new Error(`${ErrorMessage.RECORDS_ARRAY_NOT_FOUND} lesson.pages`);
  }

  return {
    previousLesson: previousLesson?._id ?? null,
    nextLesson: nextLesson?._id ?? null,
    lessonsNumber: lesson.lessonsNumber,
    pages: newPages,
  };
};
