import { NextFunction, Request, Response } from 'express';

import {
  defineAssetUrlByAssetType,
  fetchAssetsRelatedToLesson,
  fetchAssetsRelatedToSkill,
  findAssetsRelatedToSubSkillId,
  findEVAssets,
  getAssetData,
} from '../services/assets/assets.service';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';

export const getAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const assetInfo = await getAssetData(id);

    defineAssetUrlByAssetType(assetInfo);

    res.send(assetInfo);
  } catch (error) {
    next(error);
  }
};

export const getAssetsRelatedToLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonid } = req.params;
    const isGuest = !req.user.isPremium;

    const assets = await fetchAssetsRelatedToLesson(lessonid, isGuest);

    res.status(200).json(assets);
  } catch (error) {
    next(error);
  }
};

export const getAssetsRelatedToTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skillId } = req.body as { skillId: string };
    const isGuest = !req.user.isPremium;

    // METALOG - STUDENT_OPEN_STEPBYSTEP
    const studentId = req.user.id;
    if (studentId) {
      await LogService.insertOneMetaLog(
        MetalogUserEnum.STUDENT,
        studentId,
        MetalogSections.STUDENT_OPEN_SPECIFIC_TOPIC,
        `El estudiante ingreso a la habilidad : ${skillId}`
      );
    }

    const subSkills = await fetchAssetsRelatedToSkill(skillId);

    const subSkillsInfo = await Promise.all(
      subSkills.map(async (subSkill) => {
        const assetsRelated = await findAssetsRelatedToSubSkillId(
          subSkill._id,
          isGuest
        );

        return {
          idSubSkill: subSkill._id,
          subTitle: subSkill.title,
          assets: assetsRelated,
        };
      })
    );

    // EXPLANATION and VIDEOGAME ONCE PER SKILL
    const arraySkills = subSkills.map((subSkill) => {
      return subSkill._id;
    });
    const skillAssets = await findEVAssets(arraySkills, isGuest);

    const responseObject = {
      skillAssets,
      subSkillsInfo,
    };

    res.status(200).json(responseObject);
  } catch (error) {
    next(error);
  }
};
