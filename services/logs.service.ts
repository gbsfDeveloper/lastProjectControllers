import { Types } from 'mongoose';

import { METALOG_DB_CONNECTION } from '../bin/server';
import { UTCDate } from '../lib/helpers/generateDates';
import {
  InAppFeedbackAppearModel,
  LogPushNotificationModel,
  MetaLog,
  MetaLogModel,
  metaLogSchema,
} from '../models';
import { UserStatusHistoryModel } from '../models/userStatusHistory.model';

export enum MetalogSections {
  PARENT_REGISTER_STUDENT = 'PARENT_REGISTER_STUDENT',
  PARENT_USER_MANAGEMENT = 'PARENT_USER_MANAGEMENT',
  PARENT_DISABLE_STUDENT = 'PARENT_DISABLE_STUDENT',
  PARENT_LOGIN = 'PARENT_LOGIN',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  PARENT_GET_PROFILE = 'PARENT_GET_PROFILE',
  PARENT_UPDATE_PROFILE = 'PARENT_UPDATE_PROFILE',
  PARENT_UPDATE_ONLY_USERNAME = 'PARENT_UPDATE_ONLY_USERNAME',
  PARENT_GET_INAPP_FEEDBACK = 'PARENT_GET_INAPP_FEEDBACK',
  PARENT_UPDATE_INAPP_FEEDBACK = 'PARENT_UPDATE_INAPP_FEEDBACK',
  STUDENT_SIGNUP = 'STUDENT_SIGNUP',
  STUDENT_PROFILE = 'STUDENT_PROFILE',
  STUDENT_WEEKLY_GAME = 'STUDENT_WEEKLY_GAME',
  STUDENT_WEEKLY_ASSESSMENT = 'STUDENT_WEEKLY_ASSESSMENT',
  STUDENT_HOME_LESSONS = 'STUDENT_HOME_LESSONS',
  STUDENT_OPEN_LESSON = 'STUDENT_OPEN_LESSON',
  STUDENT_OPEN_STEPBYSTEP = 'STUDENT_OPEN_STEPBYSTEP',
  STUDENT_SEARCH = 'STUDENT_SEARCH',
  STUDENT_OPEN_TOPICS = 'STUDENT_OPEN_TOPICS_SKILL',
  STUDENT_OPEN_SPECIFIC_TOPIC = 'STUDENT_OPEN_SPECIFIC_TOPIC',
  STUDENT_USER_MANAGEMENT = 'STUDENT_USER_MANAGEMENT',
  STUDENT_REGISTER_PARENT = 'STUDENT_REGISTER_PARENT',
  STUDENT_OPEN_SPECIFIC_ASSET = 'STUDENT_OPEN_ASSET',
  STUDENT_UPDATE_ASSET_FEEDBACK = 'STUDENT_UPDATE_ASSET_FEEDBACK',
  STUDENT_GET_ASSET_FEEDBACK = 'STUDENT_GET_ASSET_FEEDBACK',
  STUDENT_GET_INAPP_FEEDBACK = 'STUDENT_GET_INAPP_FEEDBACK',
  STUDENT_UPDATE_INAPP_FEEDBACK = 'STUDENT_UPDATE_INAPP_FEEDBACK',
  STUDENT_GET_testPOINTS = 'STUDENT_GET_testPOINTS',
  STUDENT_INIT_ASSESSMENT = 'STUDENT_INIT_ASSESSMENT',
  STUDENT_GET_LEADERBOARD = 'STUDENT_GET_LEADERBOARD',
  OPEN_SEARCH = 'OPEN_SEARCH',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  // SERVICE LOGS
  CLOSE_ASSET = 'CLOSE_ASSET',
  CLOSE_STEPBYSTEP = 'CLOSE_STEPBYSTEP',
  CLOSE_LESSON = 'CLOSE_LESSON',
  CLOSE_SEARCH = 'CLOSE_SEARCH',
  SKIP_ASSESSMENT = 'SKIP_ASSESSMENT',
  SKIP_ASSET_FEEDBACK = 'SKIP_ASSET_FEEDBACK',
  INIT_WEEKLY_GAME = 'INIT_WEEKLY_GAME',
  INIT_WEEKLY_ASSESSMENT = 'INIT_WEEKLY_ASSESSMENT',
  INIT_LESSON_ASSET = 'INIT_LESSON_ASSET',
  NOT_VALID_EVENT = 'NOT_VALID_EVENT',
  // DATA EVENTS
  CLICK_HOME_BLOCK_LESSON = 'CLICK_HOME_BLOCK_LESSON',
  CLICK_HOME_UNLOCK_BUTTON = 'CLICK_HOME_UNLOCK_BUTTON',
  CLICK_TOPICS_UNLOCK_BUTTON = 'CLICK_TOPICS_UNLOCK_BUTTON',
  CLICK_UNLOCK_BUTTON_PARENT_DASHBOARD = 'CLICK_UNLOCK_BUTTON_PARENT_DASHBOARD',
  PARENT_PROFILE_SUBSCRIPTION_BUTTON = 'PARENT_PROFILE_SUBSCRIPTION_BUTTON',
  PAYWALL_SUBSCRIPTION_WEEKLY = 'PAYWALL_SUBSCRIPTION_WEEKLY',
  PAYWALL_SUBSCRIPTION_MONTHLY = 'PAYWALL_SUBSCRIPTION_MONTHLY',
  PAYWALL_SUBSCRIPTION_QUARTERLY = 'PAYWALL_SUBSCRIPTION_QUARTERLY',
  PAYWALL_SUBSCRIPTION_SEMIANNUAL = 'PAYWALL_SUBSCRIPTION_SEMIANNUAL',
  PAYWALL_SUBSCRIPTION_BACK_BUTTON = 'PAYWALL_SUBSCRIPTION_BACK_BUTTON',
  PARENTAL_GATE_BACK_BUTTON = 'PARENTAL_GATE_BACK_BUTTON',
  COMPLETE_PARENTAL_GATE = 'COMPLETE_PARENTAL_GATE',
  CLOSE_BUTTON_CONGRATS = 'CLOSE_BUTTON_CONGRATS',
  CONTINUE_BUTTON_CONGRATS = 'CONTINUE_BUTTON_CONGRATS',
  PAYWALL_PAYMENT = 'PAYWALL_PAYMENT',
  STEP_BY_STEP_FEEDBACK_SHOWED = 'STEP_BY_STEP_FEEDBACK_SHOWED',
  STEP_BY_STEP_FEEDBACK_CLICKED = 'STEP_BY_STEP_FEEDBACK_CLICKED',
}

export enum MetalogUserEnum {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

class LogService {
  async logPushNotification(
    parentId: Types.ObjectId,
    typePushNotification: string
  ) {
    await LogPushNotificationModel.create({
      parentId,
      typePushNotification,
      createdAt: UTCDate(),
    });
  }

  // OLD Metalog DB
  async insertOneMetaLogOLD(
    userType: string,
    userId: Types.ObjectId,
    section: string,
    description: string
  ) {
    const actualDate = UTCDate();
    const existSameDate = await MetaLogModel.findOne({
      userId,
    })
      .sort({ _id: -1 })
      .limit(1);
    const isSameSection =
      existSameDate && existSameDate.section == section ? true : false;
    if (!isSameSection) {
      await MetaLogModel.create({
        userType,
        userId,
        section,
        description,
        createdAt: actualDate,
      });
    }
  }

  // NEW Metalog DB
  async insertOneMetaLog(
    userType: string,
    userId: Types.ObjectId,
    section: string,
    description: string
  ) {
    if (METALOG_DB_CONNECTION) {
      const actualDate = UTCDate();

      const MetaLogNewModel: typeof MetaLogModel =
        METALOG_DB_CONNECTION.model<MetaLog>('metaLogs', metaLogSchema);

      const existSameDate = await MetaLogNewModel.findOne({
        userId: userId,
      } as { userId: Types.ObjectId })
        .sort({ _id: -1 })
        .limit(1);

      const isSameSection =
        existSameDate && existSameDate.section == section ? true : false;
      if (!isSameSection) {
        await MetaLogNewModel.create({
          userType,
          userId,
          section,
          description,
          createdAt: actualDate,
        });
      }
    }
  }

  async insertAppFeedbackAppear(userType: string, userId: Types.ObjectId) {
    await InAppFeedbackAppearModel.create({
      userType,
      userId,
      createdAt: UTCDate(),
    });
  }

  async getAppFeedbackAppear(userId: Types.ObjectId) {
    return await InAppFeedbackAppearModel.findOne({
      userId,
    }).lean();
  }

  async insertPaymentLog(status: string, parentId: Types.ObjectId) {
    await UserStatusHistoryModel.create({
      parentId,
      status,
      time: UTCDate(),
    });
  }
}

export default new LogService();
