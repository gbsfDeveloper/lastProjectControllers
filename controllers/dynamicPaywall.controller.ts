import { NextFunction, Request, Response } from 'express';

import { config } from '../config';
import ParentService from '../services/parent.service';
import {
  getPaywallInfo,
  getPaywallInfoById,
} from '../services/payments/prices';
import StudentService from '../services/student.service';

export const getDynamicPaywall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId = req.user.id;
    let userType = req.user.userType;

    if (userType === 'STUDENT') {
      const existParentId = await StudentService.findParentInfoWithStudentId(
        userId
      );
      if (existParentId && existParentId.parentId) {
        // Hereda la informacion del paywall del padre.
        userId = existParentId.parentId;
        userType = 'PARENT';
      }
    }

    const whiteListInfo =
      userType === 'PARENT'
        ? await ParentService.getParentPaywallInfoWhiteList(userId)
        : await StudentService.getStudentPaywallInfoWhiteList(userId);

    let paywallInfo = null;

    if (whiteListInfo && whiteListInfo.paywallCatalogId) {
      paywallInfo = await getPaywallInfoById(whiteListInfo.paywallCatalogId);
      if (!paywallInfo) {
        paywallInfo = await getPaywallInfo(whiteListInfo.paywallGroup);
      }
    } else {
      const paywallName = 'DEFAULT';
      paywallInfo = await getPaywallInfo(paywallName);
    }

    if (paywallInfo && paywallInfo.imagePaywall) {
      paywallInfo.imagePaywall = `${config.CDN_URL}${paywallInfo.imagePaywall}`;
    }

    res.status(200).json(paywallInfo);
  } catch (error) {
    next(error);
  }
};

export const getDynamicNewPaywall = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paywallName = 'NEW_DEFAULT_PAYWALL';
    const paywallInfo = await getPaywallInfo(paywallName);

    if (paywallInfo && paywallInfo.imagePaywall) {
      paywallInfo.imagePaywall = `${config.CDN_URL}${paywallInfo.imagePaywall}`;
    }

    res.status(200).json(paywallInfo);
  } catch (error) {
    next(error);
  }
};
