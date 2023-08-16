import { NextFunction, Request, Response } from 'express';

import { ErrorMessage } from '../lib/errors';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import { getPagesFromLesson } from '../services/pages';

export const pages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonId } = req.params;

    if (!lessonId) {
      throw new Error(`${ErrorMessage.MISSING_PARAM_VALUE} lessonId`);
    }

    // METALOG - STUDENT_OPEN_LESSON
    const studentId = req.user.id;
    if (studentId) {
      await LogService.insertOneMetaLog(
        MetalogUserEnum.STUDENT,
        studentId,
        MetalogSections.STUDENT_OPEN_LESSON,
        `El estudiante ingreso a la pantalla de -lesson- lessonId: ${lessonId}`
      );
    }

    const lessonPages = await getPagesFromLesson(lessonId);

    res.json(lessonPages);
  } catch (error) {
    next(error);
  }
};
