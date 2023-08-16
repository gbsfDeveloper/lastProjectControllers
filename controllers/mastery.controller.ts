import { NextFunction, Request, Response } from 'express';
import { isValidObjectId, Types } from 'mongoose';

import { config } from '../config';
import { ErrorMessage } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import { StudentSkillMasteryModel } from '../models';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';
import StudentService from '../services/student.service';
import { getItemsAnswered, getOneUserSkillsMastery } from '../services/topics';

interface UpdateSkillMasteryRequest extends Request {
  body: {
    skillId: Types.ObjectId;
    typeAsset: string;
    assetId?: Types.ObjectId;
  };
}

interface UpdateLastItemAnsweredRequest extends Request {
  body: { skillId: Types.ObjectId; isRightAnwser: boolean };
}

export const updateSkillsMastery = async (
  req: UpdateSkillMasteryRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { skillId, typeAsset } = req.body;
    let { assetId } = req.body;

    if (assetId && !isValidObjectId(assetId)) {
      assetId = undefined;
    }

    if (!typeAsset || typeof typeAsset !== 'string') {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} typeAsset, must be a string`
      );
    }

    // TRACKING
    if (assetId) {
      await StudentService.updateLoginTrakingWithAssetId(
        userId,
        typeAsset,
        skillId,
        assetId
      );

      // METALOG - STUDENT_OPEN_SPECIFIC_ASSET
      const studentId = req.user.id;
      if (studentId) {
        await LogService.insertOneMetaLog(
          MetalogUserEnum.STUDENT,
          studentId,
          MetalogSections.STUDENT_OPEN_SPECIFIC_ASSET,
          `El estudiante ingreso al asset: ${assetId.toString()} que pertenece a la habilidad: ${skillId.toString()}`
        );
      }
    } else {
      await StudentService.updateLoginTraking(userId, typeAsset, skillId);
      // METALOG - STUDENT_OPEN_SPECIFIC_ASSET
      const studentId = req.user.id;
      if (studentId) {
        await LogService.insertOneMetaLog(
          MetalogUserEnum.STUDENT,
          studentId,
          MetalogSections.STUDENT_OPEN_SPECIFIC_ASSET,
          `El estudiante ingreso al asset: - que pertenece a la habilidad: ${skillId.toString()}`
        );
      }
    }

    let skillsMaster = await getOneUserSkillsMastery(userId, skillId);

    if (skillsMaster) {
      skillsMaster.assetsStreak = {
        ...skillsMaster.assetsStreak,
        [typeAsset]: 2,
      };
    } else {
      skillsMaster = new StudentSkillMasteryModel();
      skillsMaster.userId = userId;
      skillsMaster.topicId = skillId;
      skillsMaster.assetsStreak = {
        ...skillsMaster.assetsStreak,
        [typeAsset]: 2,
      };
    }

    await skillsMaster.save();

    res.status(204).json(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
};

export const updateItemAnwsered = async (
  req: UpdateLastItemAnsweredRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { skillId, isRightAnwser } = req.body;

    if (typeof isRightAnwser !== 'boolean') {
      throw new ValidationError(
        `${ErrorMessage.WRONG_REQUEST_PROP_VALUE} isRightAnwser, must be a boolean`
      );
    }

    const itemsAnswered = await getItemsAnswered(userId, skillId);
    const tempItemsAnswered = itemsAnswered.lastItemsAnswered;
    tempItemsAnswered.pop();
    tempItemsAnswered.unshift(isRightAnwser);
    itemsAnswered.lastItemsAnswered = tempItemsAnswered;
    await itemsAnswered.save();

    res.status(204).json(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
};
