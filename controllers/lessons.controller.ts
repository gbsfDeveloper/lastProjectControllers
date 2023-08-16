import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { config } from '../config';
import { getLessons } from '../services/lessons';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import ParentService from '../services/parent.service';
import studentService from '../services/student.service';

export const lessons = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(await getLessons());
  } catch (error) {
    next(error);
  }
};

export const lessonsWithStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user.id;
    const student = await studentService.getCompletedLessons(studentId);
    const lessons = await getLessons();
    const isPremium = req.user.isPremium;

    const studentLessons = lessons.map(function (lesson) {
      let isLessonRead = false;

      // FREE LESSONS LOGIC
      let showLesson = true;
      let freeTagShow = false;
      let freeTagText = '';

      if (!isPremium) {
        showLesson = false;
        const startLessonsList: number[] =
          config.DEFAULT_LESSONS == 'ACTIVE' ? [1, 3, 7, 12, 16] : [];
        const found = startLessonsList.find(
          (element) => element == lesson.lessonsNumber
        );

        if ('isGuest' in lesson) {
          showLesson = lesson.isGuest;
        } else {
          if (found) showLesson = true;
        }

        freeTagShow = showLesson;
        freeTagText = showLesson ? 'GRATIS' : '';
      }
      // END FREE LESSONS LOGIC

      // LESSONS READ LOGIC
      if (student) {
        if (student.completedLessons.includes(lesson._id)) {
          isLessonRead = true;
        }
      }
      const pageList = [];
      for (let i = lesson.firstPage; i <= lesson.lastPage; i++) {
        pageList.push(i);
      }
      lesson.pageList = pageList.join(',');

      return {
        ...lesson,
        isGuest: undefined, //not appear on response
        show: showLesson,
        isLessonRead,
        freeTagShow,
        freeTagText,
      };
    });

    // METALOG - STUDENT_HOME_LESSONS
    await LogService.insertOneMetaLog(
      MetalogUserEnum.STUDENT,
      studentId,
      MetalogSections.STUDENT_HOME_LESSONS,
      'El estudiante ingreso a la pantalla de -home-'
    );

    res.json(studentLessons);
  } catch (error) {
    next(error);
  }
};

export const lessonsReadedWithStudentId = async (studentId: Types.ObjectId) => {
  const student = await studentService.getCompletedLessons(studentId);
  const lessons = await getLessons();

  const studentLessons = lessons.filter(function (lesson) {
    let isLessonRead = false;
    if (student) {
      if (student.completedLessons.includes(lesson._id)) {
        isLessonRead = true;
      }
    }
    if (isLessonRead) {
      return lesson;
    }
  });

  return studentLessons;
};

export const isStudentWhiteListPremium = async (
  studentId: Types.ObjectId,
  isPremium: boolean
) => {
  let studentExistInWhiteList = undefined;
  let parentExistInWhiteList = undefined;
  let parentPremiumInfo = null;

  studentExistInWhiteList = await studentService.findStudentOnPaywallWhiteList(
    studentId
  );

  const parentInfo = await studentService.findParentInfoWithStudentId(
    studentId
  );

  if (parentInfo && parentInfo.parentId) {
    parentExistInWhiteList = await ParentService.findParentOnPaywallWhiteList(
      parentInfo.parentId
    );

    parentPremiumInfo = await ParentService.findParentPremiumInfo(
      parentInfo.parentId
    );

    if (
      parentPremiumInfo &&
      parentPremiumInfo.relatedGooglePurchaseTokens.length < 1 &&
      !parentPremiumInfo.appleOriginalTransactionId
    ) {
      isPremium = false;
    }
  }

  if (!parentExistInWhiteList && !studentExistInWhiteList) {
    isPremium = true;
  }

  return isPremium;
};
