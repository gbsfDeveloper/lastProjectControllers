import { Types } from 'mongoose';

import { RankingModel, StudentModel } from '../../models';

export const findFirstTenPlaces = () => {
  return RankingModel.find()
    .sort({ weektestPoints: -1 })
    .limit(10)
    .select('-_id studentId rankingPlace weektestPoints totaltestPoints')
    .lean()
    .exec();
};

export const findRankingNamesByIdsArray = (
  arrayOfRankingIds: Array<Types.ObjectId>
) => {
  return StudentModel.find({
    _id: {
      $in: arrayOfRankingIds,
    },
  })
    .select('_id username')
    .lean()
    .exec();
};

export const findByUserRankingById = (studentId: Types.ObjectId) =>
  RankingModel.findOne({ studentId }).lean().exec();

export const resetWeeklyRanking = () => {
  return RankingModel.updateMany(
    { weektestPoints: { $gt: 0 } },
    { $set: { weektestPoints: 0 } }
  );
};
