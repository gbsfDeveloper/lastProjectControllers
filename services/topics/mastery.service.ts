import { Types } from 'mongoose';

import { noRecordFound } from '../../lib/errors';
import { validateMongoID } from '../../lib/helpers/validateMongoID';
import {
  SkillModel,
  StudentSkillMastery,
  StudentSkillMasteryModel,
} from '../../models';

export const getOneUserSkillsMastery = async (
  userId: Types.ObjectId,
  skillId: Types.ObjectId
) => {
  validateMongoID(skillId, 'skillId');

  return StudentSkillMasteryModel.findOne({ userId, topicId: skillId })
    .select('skillId userId assetsStreak')
    .exec();
};

export const getItemsAnswered = async (
  userId: Types.ObjectId,
  skillId: Types.ObjectId
) => {
  validateMongoID(skillId, 'skillId');

  const studentSkillMastery =
    (await StudentSkillMasteryModel.findOne({
      userId,
      topicId: skillId,
    })
      .select('skillId userId lastItemsAnswered')
      .exec()) ?? noRecordFound('studentSkillMastery');

  return studentSkillMastery;
};

export const getItemsAnsweredNoError = async (
  userId: Types.ObjectId,
  skillId: Types.ObjectId
) => {
  validateMongoID(skillId, 'skillId');

  const studentSkillMastery = await StudentSkillMasteryModel.findOne({
    userId,
    topicId: skillId,
  })
    .select('skillId userId lastItemsAnswered')
    .exec();

  return studentSkillMastery;
};

export const getAllUserSkillsMastery = async (userId: Types.ObjectId) => {
  return StudentSkillMasteryModel.find({ userId }).lean().exec();
};

export const getSkillsIds = async (subSkillsIds: Types.ObjectId[]) => {
  return await SkillModel.find({ relatedSubSkillsId: { $in: subSkillsIds } })
    .select('_id')
    .exec();
};

export const insertStudentMastery = async (
  userId: Types.ObjectId,
  skillId: Types.ObjectId,
  masteryInfo: Partial<StudentSkillMastery>
) => {
  return StudentSkillMasteryModel.findOneAndUpdate(
    { userId, skillId },
    masteryInfo,
    { new: true, upsert: true }
  );
};
