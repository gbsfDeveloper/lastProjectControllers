import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { config } from '../config';
import { generateAccessToken } from '../lib/helpers/generateAccessToken';
import { UserTypes } from '../middlewares/authentication';
import { AvatarType, Parent } from '../models';
import HubspotService from '../services/hubspot.service';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import ParentService from '../services/parent.service';
import StudentService from '../services/student.service';

interface StudentInfo {
  accessToken: string;
  student: Types.ObjectId;
  avatar: AvatarType;
  username: string;
}

export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    const parent = await ParentService.findParentStudentsWithId(parentId);
    const managementInfo = await generateParentUserManagementInfo(parent);
    // METALOG - PARENT_USER_MANAGEMENT
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parentId,
      MetalogSections.PARENT_USER_MANAGEMENT,
      `El padre ingreso a la seccion de -usuarios-`
    );
    res.status(200).json(managementInfo);
  } catch (error) {
    next(error);
  }
};

export const generateParentUserManagementInfo = async (parent: Parent) => {
  const students: Array<Types.ObjectId> = parent.students;
  const studentsInfo: Array<StudentInfo> = [];
  for (const student of students) {
    const studentInfo = await StudentService.findStudentsManageInfoWithId(
      student
    );

    const studentAccesToken = generateAccessToken({
      id: student._id,
      userType: UserTypes.STUDENT,
    });

    if (studentInfo) {
      const { avatar, isActiveForParent, username } = studentInfo;
      if (isActiveForParent) {
        studentsInfo.push({
          accessToken: studentAccesToken,
          student,
          avatar,
          username,
        });
      }
    }
  }
  return studentsInfo.slice(0, 3);
};

export const disableStudentForParent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    const { studentId } = req.body as { studentId: Types.ObjectId };

    //HUBSPOT
    if (config.NODE_ENV !== 'development') {
      const studentInfo = await StudentService.findStudentsManageInfoWithId(
        studentId
      );
      if (studentInfo) {
        const parentInfoEmail = await ParentService.findParentEmailWithId(
          parentId
        );
        HubspotService.onRemoveStudent({
          parentEmail: parentInfoEmail ? parentInfoEmail.email : '',
          username: studentInfo.username,
          parent_id: '',
          student_id: '',
        });
      }
    }

    // METALOG - PARENT_DISABLE_STUDENT
    await LogService.insertOneMetaLog(
      MetalogUserEnum.PARENT,
      parentId,
      MetalogSections.PARENT_DISABLE_STUDENT,
      `El padre deshabilito al estudiante ${studentId.toString()}`
    );

    await StudentService.disableStudentsWithId(studentId, parentId);
    res.status(204).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
