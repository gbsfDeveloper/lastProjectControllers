import { NextFunction, Request, Response } from 'express';

import { UserTypes } from '../middlewares/authentication';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import pointsService from '../services/testPoints.service';
import ParentService from '../services/parent.service';
import StudentService from '../services/student.service';

interface ParentAppFeedbackBody {
  recommendToFriend: number;
  isEasyToUse: boolean;
  areMyKidsLearn: boolean;
  doYouLikeTopics: boolean;
  comment: string;
}

interface StudenAppFeedbackBody {
  recommendToFriend: number;
  comment: string;
}

export const getParentInAppFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    const existInAppFeedback = await ParentService.findParentInAppFeedback(
      parentId
    );
    let isInAppFeedback = false;
    if (existInAppFeedback) {
      isInAppFeedback = true;
    }

    // METALOG - PARENT_GET_INAPP_FEEDBACK
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parentId,
      MetalogSections.PARENT_GET_INAPP_FEEDBACK,
      `El padre entro a la seccion de -inAppFeedback-`
    );

    res.status(200).json({ isInAppFeedback });
  } catch (error) {
    next(error);
  }
};

export const updateParentInAppFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;

    const {
      recommendToFriend,
      isEasyToUse,
      areMyKidsLearn,
      doYouLikeTopics,
      comment,
    } = req.body as ParentAppFeedbackBody;

    const parentStudents = await ParentService.findParentStudentsWithId(
      parentId
    );

    parentStudents.students.forEach(async (studentID) => {
      await pointsService.functionUpdatetestPoints(studentID, 20);
    });

    await ParentService.updateInAppFeedback(
      parentId,
      recommendToFriend,
      isEasyToUse,
      areMyKidsLearn,
      doYouLikeTopics,
      comment
    );

    // METALOG - PARENT_UPDATE_INAPP_FEEDBACK
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parentId,
      MetalogSections.PARENT_UPDATE_INAPP_FEEDBACK,
      `El padre actualizo su -inAppFeedback- a: ${JSON.stringify(req.body)}`
    );

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const getStudentInAppFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user.id;
    const existInAppFeedback = await StudentService.findStudentInAppFeedback(
      studentId
    );
    let isInAppFeedback = false;
    if (existInAppFeedback) {
      isInAppFeedback = false;
    }

    // METALOG - STUDENT_GET_INAPP_FEEDBACK
    await LogService.insertOneMetaLog(
      MetalogUserEnum.STUDENT,
      studentId,
      MetalogSections.STUDENT_GET_INAPP_FEEDBACK,
      `El estudiante entro a la seccion de -inAppFeedback-`
    );

    res.status(200).json({ isInAppFeedback });
  } catch (error) {
    next(error);
  }
};

export const updateStudentInAppFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user.id;

    const { recommendToFriend, comment } = req.body as StudenAppFeedbackBody;

    await StudentService.updateInAppFeedback(
      studentId,
      recommendToFriend,
      comment
    );

    await pointsService.functionUpdatetestPoints(studentId, 20);

    // METALOG - STUDENT_UPDATE_INAPP_FEEDBACK
    await LogService.insertOneMetaLog(
      MetalogUserEnum.STUDENT,
      studentId,
      MetalogSections.STUDENT_UPDATE_INAPP_FEEDBACK,
      `El estudiante actualizo su -inAppFeedback- a: ${JSON.stringify(
        req.body
      )}`
    );

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const getInAppFeedbackAppear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const existFeedbackAppear = await LogService.getAppFeedbackAppear(userId);

    const isParentUser = req.user.userType === UserTypes.PARENT;

    let showInAppFeedback = false;

    if (existFeedbackAppear) {
      const creationDate = existFeedbackAppear.createdAt;
      const daysDiff = getDifferenceBetweenTodayAndDate(creationDate);

      const existInAppFeedback = isParentUser
        ? await ParentService.findParentInAppFeedback(userId)
        : await StudentService.findStudentInAppFeedback(userId);

      if (daysDiff >= 3 && !existInAppFeedback) {
        showInAppFeedback = true;
      }
    }

    res.status(200).json({ showInAppFeedback });
  } catch (error) {
    next(error);
  }
};

export const getInAppFeedbackAppearParent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    const existFeedbackAppear = await LogService.getAppFeedbackAppear(parentId);
    let showInAppFeedback = false;
    if (existFeedbackAppear) {
      const creationDate = existFeedbackAppear.createdAt;
      const daysDiff = getDifferenceBetweenTodayAndDate(creationDate);
      const existInAppFeedback = await ParentService.findParentInAppFeedback(
        parentId
      );
      if (daysDiff >= 3 && !existInAppFeedback) {
        showInAppFeedback = true;
      }
    }
    res.status(200).json({ showInAppFeedback });
  } catch (error) {
    next(error);
  }
};

const getDifferenceBetweenTodayAndDate = (date: Date): number => {
  const str_creationDate = date.toISOString().split('T')[0];
  const str_todayDate = new Date().toISOString().split('T')[0];
  const creationDate: any = new Date(str_creationDate);
  const todayDate: any = new Date(str_todayDate);
  const diffTime = Math.abs(todayDate - creationDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
