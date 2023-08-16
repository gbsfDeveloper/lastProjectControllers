import { Request, Response } from 'express';
import { LeanDocument, Types } from 'mongoose';

import { config } from '../config';
import { AvatarType, Parent, StudentSkillMastery } from '../models';
import { getHeadOfDisplay } from '../services/headOfDisplay';
import HubspotService from '../services/hubspot.service';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import ParentService from '../services/parent.service';
import { findByUserRankingById } from '../services/ranking/ranking.service';
import StudentService from '../services/student.service';
import { getAllUserSkillsMastery, getSkills } from '../services/topics';
import { findStudentPlaceOnLeaderboard } from './headOfDisplay.controller';

interface HeadOfDisplay {
  avatar: AvatarType;
  username: string;
  streak: Array<boolean>;
  points: number;
  ranking: number;
}

interface StudentInfo {
  avatar: AvatarType;
  username: string;
  hodStreak: Array<boolean>;
  hodPoints: number;
  hodRanking: number;
  hodTopicsViewed: number;
  studentId: Types.ObjectId;
  weekProgress: number;
  generalProgress: number;
  exploredTopics: any;
}

export const parentDashboard = async (req: Request, res: Response) => {
  const parentId = req.user.id;
  // HUBSPOT
  if (config.NODE_ENV !== 'development') {
    await sendInfoToHubspot(parentId);
  }
  const parent = await ParentService.findParentStudentsWithId(parentId);
  const parentAvancedDashboardInfo = await generateStudentInfo(parent);
  // METALOG - PARENT_DASHBOARD
  await LogService.insertOneMetaLog(
    MetalogUserEnum.PARENT,
    parentId,
    MetalogSections.PARENT_DASHBOARD,
    `El padre entro a la seccion -dashboard-`
  );

  // LOG HOME_VISIT - InAppFeedbackAppear - for wait 3 days before inapp appear
  const existFeedbackAppear = await LogService.getAppFeedbackAppear(parentId);
  if (!existFeedbackAppear) {
    await LogService.insertAppFeedbackAppear(MetalogUserEnum.PARENT, parentId);
  }

  res.json(parentAvancedDashboardInfo);
};

const createHeadOfDisplayParentDashboard = async (
  studentId: Types.ObjectId
) => {
  const student = await getHeadOfDisplay(studentId);
  const rankingInfo = await findByUserRankingById(studentId);
  const points = rankingInfo ? rankingInfo.weektestPoints : 0;
  const rankingPlace = await findStudentPlaceOnLeaderboard(studentId);
  const ranking = typeof rankingPlace == 'number' ? rankingPlace : 10;

  const headOfDisplayResponse: HeadOfDisplay = {
    avatar: student.avatar,
    username: student.username,
    streak: student.streak
      ? Object.values(student.streak)
      : (new Array(5).fill(false) as Array<boolean>),
    points,
    ranking,
  };

  return headOfDisplayResponse;
};

const generateStudentInfo = async (parent: Parent) => {
  const students: Array<Types.ObjectId> = parent.students;
  const studentsInfo: Array<StudentInfo> = [];
  for (const student of students) {
    const studentInfo = await StudentService.findStudentsManageInfoWithId(
      student
    );
    const headOfDisplayInfo = await createHeadOfDisplayParentDashboard(student);
    const topicsInfo = await generateStudentTopicsInfo(student);
    const skillsMasteries = await getAllUserSkillsMastery(student);
    const generalProgress = generateGeneralAnualProgressInfo(skillsMasteries);
    if (studentInfo) {
      studentsInfo.push({
        avatar: headOfDisplayInfo.avatar,
        username: headOfDisplayInfo.username,
        hodStreak: headOfDisplayInfo.streak,
        hodPoints: headOfDisplayInfo.points,
        hodRanking: headOfDisplayInfo.ranking,
        hodTopicsViewed: skillsMasteries.length,
        studentId: student,
        weekProgress: 25,
        generalProgress: parseInt(generalProgress.toString()),
        exploredTopics: topicsInfo,
      });
    }
  }
  return studentsInfo.slice(0, 3);
};

const generateGeneralAnualProgressInfo = (
  skillsMasteries: LeanDocument<
    StudentSkillMastery &
      Required<{
        _id: Types.ObjectId;
      }>
  >[]
) => {
  let skillPercentTotal = 0;
  skillsMasteries.forEach((skillMastery) => {
    const itemsAnswered = skillMastery.lastItemsAnswered;
    const lastTenItems = itemsAnswered.slice(-10, itemsAnswered.length);
    lastTenItems.forEach((answer) => {
      skillPercentTotal += answer ? 10 : 0;
    });
  });
  // CONTENIDO ANUAL = SUMA DE LAS RESPUESTAS CORRECTAS EN TODAS LAS SKILLS / CANTIDAD DE SKILLS CONTESTADAS
  return skillsMasteries.length > 0
    ? skillPercentTotal / skillsMasteries.length
    : 0;
};

const generateStudentTopicsInfo = async (userId: Types.ObjectId) => {
  const skillsMasteries = await getAllUserSkillsMastery(userId);
  const allTopics = await getSkills();
  const studentTopics = allTopics.map((topic) => {
    let skillPercent = 0;

    const foudSkillMastery = skillsMasteries.find((skillMastery) =>
      skillMastery.topicId.equals(topic._id)
    );

    const itemsAnswered = foudSkillMastery
      ? foudSkillMastery.lastItemsAnswered
      : new Array(10).fill(false);

    const lastTenItems = itemsAnswered.slice(-10, itemsAnswered.length);

    lastTenItems.forEach((answer) => {
      skillPercent += answer ? 10 : 0;
    });

    const assetsStreak = foudSkillMastery
      ? {
          stepByStep: foudSkillMastery.assetsStreak.STEPBYSTEP,
          explanation: foudSkillMastery.assetsStreak.EXPLANATION,
          infographic: foudSkillMastery.assetsStreak.INFOGRAPHIC,
          video: foudSkillMastery.assetsStreak.VIDEO,
          story: foudSkillMastery.assetsStreak.STORY,
          game: foudSkillMastery.assetsStreak.VIDEOGAME,
        }
      : {
          stepByStep: 1,
          explanation: 1,
          infographic: 1,
          video: 1,
          story: 1,
          game: 1,
        };
    return {
      ...topic,
      assetsStreak,
      skillPercent,
      isWeekTopic: false,
    };
  });
  return studentTopics;
};

const sendInfoToHubspot = async (parentId: Types.ObjectId) => {
  // ACTUAL DATE
  const todayDate = new Date().toISOString().split('T')[0];
  const isVisitedToday = await HubspotService.findDailyParentDashboardVisit(
    parentId,
    todayDate
  );
  if (!isVisitedToday) {
    const parentInfoEmail = await ParentService.findParentEmailWithId(parentId);
    HubspotService.onDailyParentDashboardVisit({
      parent_id: parentId.toString(),
      parentEmail: parentInfoEmail ? parentInfoEmail.email : '',
      username: '',
      student_id: '',
    });
    await HubspotService.saveDailyParentDashboardVisit(parentId, todayDate);
  }
};
