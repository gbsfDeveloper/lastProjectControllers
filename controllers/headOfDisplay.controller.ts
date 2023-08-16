import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import {
  getDashboardHeadOfDisplay,
  getHeadOfDisplay,
} from '../services/headOfDisplay';
import LogService, { MetalogUserEnum } from '../services/logs.service';
import { getProductTagBothStores } from '../services/payments/prices';
import { findFirstTenPlaces } from '../services/ranking/ranking.service';
import { findByUserRankingById } from '../services/ranking/ranking.service';
import StudentService from '../services/student.service';

export const headOfDisplay = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user.id;
    const student = await getHeadOfDisplay(studentId);
    const rankingInfo = await findByUserRankingById(studentId);
    const points = rankingInfo ? rankingInfo.weektestPoints : 0;
    const rankingPlace = await findStudentPlaceOnLeaderboard(studentId);
    const ranking = typeof rankingPlace == 'number' ? rankingPlace : 10;
    const premiumTagObj = await getPremiumStatus(req.user.isPremium, studentId);

    // LOG HOME_VISIT - InAppFeedbackAppear - for wait 3 days before inapp appear
    const existFeedbackAppear = await LogService.getAppFeedbackAppear(
      studentId
    );

    if (!existFeedbackAppear) {
      await LogService.insertAppFeedbackAppear(
        MetalogUserEnum.STUDENT,
        studentId
      );
    }

    const headOfDisplayResponse = {
      avatar: student.avatar,
      username: student.username,
      streak: student.streak
        ? Object.values(student.streak)
        : new Array(5).fill(false),
      points,
      ranking,
      showPremiumTag: premiumTagObj.showPremiumTag,
      premiumTag: premiumTagObj.premiumTag,
    };

    res.status(200).json(headOfDisplayResponse);
  } catch (error) {
    next(error);
  }
};

export const getPremiumStatus = async (
  isPremium: boolean,
  studentId: Types.ObjectId
) => {
  let showPremiumTag = false;
  let premiumTag = 'BETA';
  if (isPremium) {
    const paymentParams = await StudentService.getPaymentParams(studentId);

    if (
      paymentParams.relatedGooglePurchaseTokens.length < 1 &&
      !paymentParams.appleOriginalTransactionId
    ) {
      paymentParams.subscription.status = 'FREEMIUM';
    }

    if (paymentParams.subscription.status === 'PREMIUM') {
      const premiumFound = await getProductTagBothStores(
        paymentParams.subscription.cadence
      );
      if (premiumFound) {
        premiumTag = premiumFound;
        showPremiumTag = true;
      }
    }
  }

  return { showPremiumTag, premiumTag };
};

export const dashboardHeadOfDisplay = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    const headsOfDisplay = await getDashboardHeadOfDisplay(parentId);

    res.status(200).json(headsOfDisplay);
  } catch (error) {
    next(error);
  }
};

export const findStudentPlaceOnLeaderboard = async (
  studentId: Types.ObjectId
) => {
  const leaderboard = await findFirstTenPlaces();

  let rankingActualPlace = 1;

  const createRanking = leaderboard.map((leaderElement) => {
    const foudStudentName =
      studentId.toString() == leaderElement.studentId.toString();

    leaderElement.rankingPlace = rankingActualPlace++;

    if (foudStudentName) {
      return leaderElement.rankingPlace;
    }
    return false;
  });
  const filterRanking = createRanking.filter(
    (rankingElement) => rankingElement != false
  );
  return filterRanking[0];
};
