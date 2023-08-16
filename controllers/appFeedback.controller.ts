import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import StudentService from '../services/student.service';

interface StudenAppFeedbackBody {
  assetId: Types.ObjectId;
  isLike?: boolean;
  isLearn?: boolean;
}

interface StudenAppFeedback {
  assetId: Types.ObjectId;
  isLike: boolean;
  isLearn: boolean;
}
interface StudenAppFeedbackResponse {
  isLike: boolean;
  isLearn: boolean;
}

export const updateAppFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body as StudenAppFeedbackBody;
    const studentId = req.user.id;
    const { assetId } = body;
    const studentFeedback: StudenAppFeedback | null =
      await StudentService.getStudentAppFeedback(studentId, assetId);

    let isLike =
      existProperty(body, 'isLike') && typeof body.isLike === 'boolean'
        ? body.isLike
        : false;
    let isLearn =
      existProperty(body, 'isLearn') && typeof body.isLearn === 'boolean'
        ? body.isLearn
        : false;

    if (studentFeedback) {
      if (!existProperty(body, 'isLike')) {
        isLike = studentFeedback.isLike;
      }
      if (!existProperty(body, 'isLearn')) {
        isLearn = studentFeedback.isLearn;
      }
    }

    await StudentService.updateStudentAppFeedback(
      studentId,
      isLike,
      isLearn,
      assetId
    );

    // METALOG - STUDENT_UPDATE_ASSET_FEEDBACK
    await LogService.insertOneMetaLog(
      MetalogUserEnum.STUDENT,
      studentId,
      MetalogSections.STUDENT_UPDATE_ASSET_FEEDBACK,
      `El estudiante actualizo su -assetfeedback- del asset:${assetId.toString()} a: ${JSON.stringify(
        body
      )}`
    );

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const getAppFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { assetId } = req.body as { assetId: Types.ObjectId };
    const studentId = req.user.id;

    const studentFeedback: StudenAppFeedback | null =
      await StudentService.getStudentAppFeedback(studentId, assetId);

    let studentFeedbackResponse: StudenAppFeedbackResponse = {
      isLike: false,
      isLearn: false,
    };

    if (studentFeedback) {
      studentFeedbackResponse = {
        isLike: studentFeedback.isLike,
        isLearn: studentFeedback.isLearn,
      };
    }

    // METALOG - STUDENT_GET_ASSET_FEEDBACK
    await LogService.insertOneMetaLog(
      MetalogUserEnum.STUDENT,
      studentId,
      MetalogSections.STUDENT_GET_ASSET_FEEDBACK,
      `El estudiante entro a la seccion -assetfeedback-`
    );

    res.status(200).json(studentFeedbackResponse);
  } catch (error) {
    next(error);
  }
};

const existProperty = (
  object: StudenAppFeedbackBody,
  key: keyof StudenAppFeedbackBody
): boolean => {
  return Object.prototype.hasOwnProperty.call(object, key);
};
