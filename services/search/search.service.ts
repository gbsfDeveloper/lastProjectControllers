import { LessonModel, LessonSearch } from '../../models';
import {
  AssetModel,
  AssetSearch,
  AssetTypeEnum,
} from '../../models/asset.model';
import {
  addLessonThumbnail,
  defineAssetThumbnailByAssetType,
  defineAssetUrlByAssetType,
} from '../assets/assets.service';

function diacriticSensitiveRegex(string = '') {
  return string
    .replace(/a/g, '[a,á]')
    .replace(/e/g, '[e,é]')
    .replace(/i/g, '[i,í]')
    .replace(/o/g, '[o,ó]')
    .replace(/u/g, '[u,ü,ú]');
}

export const getAssets = async (
  key: string[],
  titleSearch: string,
  isGuest: boolean
): Promise<Array<AssetSearch>> => {
  const query = isGuest
    ? {
        $or: [
          { searchMetadata: { $in: key.map(diacriticSensitiveRegex) } },
          {
            title: {
              $regex: diacriticSensitiveRegex(titleSearch),
              $options: 'i',
            },
          },
        ],
        isGuest: true,
      }
    : {
        $or: [
          { searchMetadata: { $in: key.map(diacriticSensitiveRegex) } },
          {
            title: {
              $regex: diacriticSensitiveRegex(titleSearch),
              $options: 'i',
            },
          },
        ],
      };

  const assets = await AssetModel.find(query)
    .select('assetType title thumbnail assetUrl relatedSubSkillsId')
    .lean()
    .exec();

  const explanationAssets = assets.filter(
    (asset) => asset.assetType === AssetTypeEnum.EXPLANATION
  );

  const infographicAssets = assets.filter(
    (asset) => asset.assetType === AssetTypeEnum.INFOGRAPHIC
  );

  const storyAssets = assets.filter(
    (asset) => asset.assetType === AssetTypeEnum.STORY
  );

  const videoAssets = assets.filter(
    (asset) => asset.assetType === AssetTypeEnum.VIDEO
  );

  const gameAssets = assets.filter(
    (asset) => asset.assetType === AssetTypeEnum.VIDEOGAME
  );

  return [
    ...explanationAssets,
    ...infographicAssets,
    ...storyAssets,
    ...videoAssets,
    ...gameAssets,
  ].map((asset) => {
    defineAssetThumbnailByAssetType(asset);
    defineAssetUrlByAssetType(asset);
    return asset;
  });
};

export const getLessons = async (
  key: string[],
  titleSearch: string
): Promise<Array<LessonSearch>> => {
  const lessons = await LessonModel.find({
    $or: [
      { searchMetadata: { $in: key.map(diacriticSensitiveRegex) } },
      {
        title: { $regex: diacriticSensitiveRegex(titleSearch), $options: 'i' },
      },
    ],
  })
    .select('title lessonsNumber')
    .lean()
    .exec();

  return lessons.map(addLessonThumbnail);
};
