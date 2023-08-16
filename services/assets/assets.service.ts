import { isValidObjectId, LeanDocument, Types } from 'mongoose';

import { config } from '../../config';
const { defaults } = config;

import { noRecordFound } from '../../lib/errors';
import { validateMongoID } from '../../lib/helpers/validateMongoID';
import {
  Asset,
  AssetModel,
  AssetTypeEnum,
  Lesson,
  LessonModel,
  SkillModel,
  SubSkillModel,
} from '../../models';

async function findAsset(assetId: string) {
  return AssetModel.findOne({ _id: assetId, isActive: true })
    .select('title relatedSubSkillsId assetUrl')
    .lean()
    .exec();
}

export const getAssetData = async (assetId: string) => {
  validateMongoID(assetId, 'asset');

  return (await findAsset(assetId)) ?? noRecordFound('assetId');
};

export const addLessonThumbnail = (
  lesson: LeanDocument<Lesson> & {
    thumbnail?: string;
  }
) => {
  lesson.thumbnail = `${config.CDN_URL}${defaults.LESSON_THUMBNAIL_URL}`;
  return lesson;
};

export const defineAssetUrlByAssetType = (asset: LeanDocument<Asset>) => {
  switch (asset.assetType) {
    case 'VIDEO':
      // This comes from VIMEO, this means it is not stored in our CDN.
      break;
    case 'STORY':
      // This comes from VIMEO, this means it is not stored in our CDN.
      break;
    case 'WHITEBOARD':
      // This comes from VIMEO, this means it is not stored in our CDN.
      break;
    default: // All three other types are VIDEOGAME, INFOGRAPHIC, and EXPLANATION
      asset.assetUrl = `${config.CDN_URL}${asset.assetUrl}`;
      break;
  }
};

export const defineAssetThumbnailByAssetType = (
  asset: LeanDocument<Asset & Required<{ _id: Types.ObjectId }>>
) => {
  if (!asset.thumbnail) {
    asset.thumbnail = config.CDN_URL;
    switch (asset.assetType) {
      case 'VIDEO':
        asset.thumbnail += defaults.ASSET_VIDEOS_THUMBNAIL_URL;
        break;
      case 'INFOGRAPHIC':
        asset.thumbnail += defaults.ASSET_INFOGRAPHICS_THUMBNAIL_URL;
        break;
      case 'EXPLANATION':
        asset.thumbnail += defaults.ASSET_EXPLANATIONS_THUMBNAIL_URL;
        break;
      case 'VIDEOGAME':
        asset.thumbnail += defaults.ASSET_GAMES_THUMBNAIL_URL;
        break;
      case 'STORY':
        asset.thumbnail += defaults.ASSET_VIDEOS_THUMBNAIL_URL;
        break;
      case 'WHITEBOARD':
        asset.thumbnail += defaults.ASSET_WHITEBOARD_THUMBNAIL_URL;
        break;
      default:
        break;
    }
  } else {
    asset.thumbnail = `${config.CDN_URL}${asset.thumbnail}`;
  }

  return asset;
};

async function findSeveralAssets(
  verifiedAssetsIds: string[],
  isGuest: boolean
) {
  const query = isGuest
    ? {
        _id: { $in: verifiedAssetsIds },
        isActive: true,
        isGuest: isGuest,
      }
    : {
        _id: { $in: verifiedAssetsIds },
        isActive: true,
      };

  return (
    (
      await AssetModel.find(query)
        .sort({ assetType: -1 })
        .select('thumbnail title assetType assetUrl relatedSubSkillsId')
        .lean()
        .exec()
    ).map((asset) => {
      defineAssetThumbnailByAssetType(asset);
      defineAssetUrlByAssetType(asset);
      return asset;
    }) ?? noRecordFound(`Assets with query: ${String(query)}`)
  );
}

export const fetchAssetsRelatedToLesson = async (
  lessonId: string,
  isGuest: boolean
) => {
  validateMongoID(lessonId, 'lesson');

  const lesson =
    (await LessonModel.findById(lessonId)
      .select('relatedAssets')
      .lean()
      .exec()) ?? noRecordFound('lesson');

  const { relatedAssets } = lesson;
  if (!relatedAssets) return [];

  const validatedAssetsIds = relatedAssets.filter((assetId) =>
    isValidObjectId(assetId)
  );

  return findSeveralAssets(validatedAssetsIds, isGuest);
};

export const getGameBySeasonId = async (seasonId: Types.ObjectId) => {
  const query = {
    assetType: AssetTypeEnum.VIDEOGAME,
    season: {
      $in: [seasonId],
    },
    isActive: true,
  };

  const game = await AssetModel.findOne(query)
    .select('assetType title thumbnail assetUrl')
    .lean()
    .exec();

  if (game) {
    if (!game.thumbnail) {
      game.thumbnail = defaults.ASSET_GAMES_THUMBNAIL_URL;
    }

    defineAssetUrlByAssetType(game);
    defineAssetThumbnailByAssetType(game);
  }

  return game;
};

export const getRandomVideogame = async () => {
  const videogame =
    (await AssetModel.findOne({
      assetType: AssetTypeEnum.VIDEOGAME,
      isActive: true,
    })
      .select('assetType title thumbnail assetUrl')
      .lean()
      .exec()) ?? noRecordFound('asset: videogame');

  if (!videogame.thumbnail) {
    videogame.thumbnail = defaults.ASSET_GAMES_THUMBNAIL_URL;
  }

  defineAssetUrlByAssetType(videogame);
  defineAssetThumbnailByAssetType(videogame);

  return videogame;
};

export const fetchAssetsRelatedToSkill = async (_id: string) => {
  const skill =
    (await SkillModel.findById({ _id })
      .select('relatedSubSkillsId')
      .lean()
      .exec()) ?? noRecordFound('skills');
  const { relatedSubSkillsId } = skill;
  const subSkills = await SubSkillModel.find({
    _id: { $in: relatedSubSkillsId },
  })
    .select('_id title')
    .exec();
  return subSkills;
};

export const findAssetsRelatedToSubSkillId = async (
  subSkillId: Types.ObjectId,
  isGuest: boolean
) => {
  const query = isGuest
    ? {
        relatedSubSkillsId: { $eq: subSkillId },
        assetType: { $nin: ['EXPLANATION', 'VIDEOGAME'] },
        isActive: true,
        isGuest: isGuest,
      }
    : {
        relatedSubSkillsId: { $eq: subSkillId },
        assetType: { $nin: ['EXPLANATION', 'VIDEOGAME'] },
        isActive: true,
      };

  return (
    (
      await AssetModel.find(query)
        .select('thumbnail title assetType assetUrl relatedSubSkillsId')
        .lean()
        .exec()
    ).map((asset) => {
      defineAssetThumbnailByAssetType(asset);
      defineAssetUrlByAssetType(asset);
      return asset;
    }) ?? noRecordFound(`Assets with query: ${String(query)}`)
  );
};

export const findEVAssets = async (
  subSkillsId: Types.ObjectId[],
  isGuest: boolean
) => {
  const query = isGuest
    ? {
        relatedSubSkillsId: { $in: subSkillsId },
        assetType: { $in: ['EXPLANATION', 'VIDEOGAME'] },
        isActive: true,
        isGuest: isGuest,
      }
    : {
        relatedSubSkillsId: { $in: subSkillsId },
        assetType: { $in: ['EXPLANATION', 'VIDEOGAME'] },
        isActive: true,
      };

  return (
    (
      await AssetModel.find(query)
        .select('thumbnail title assetType assetUrl relatedSubSkillsId')
        .lean()
        .exec()
    ).map((asset) => {
      defineAssetThumbnailByAssetType(asset);
      defineAssetUrlByAssetType(asset);
      return asset;
    }) ?? noRecordFound(`Assets with query: ${String(query)}`)
  );
};
