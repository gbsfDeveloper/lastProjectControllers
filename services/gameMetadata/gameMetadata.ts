import { Types } from 'mongoose';

import { validateMongoID } from '../../lib/helpers/validateMongoID';
import { GameMetadataModel } from '../../models/gameMetadata.model';

export const storeGameMetadata = async ({
  gameId,
  gameMetadata,
  studentId,
}: {
  gameId: Types.ObjectId;
  studentId: Types.ObjectId;
  gameMetadata: string;
}) => {
  validateMongoID(gameId, 'assets');
  await GameMetadataModel.findOneAndUpdate(
    {
      gameId,
      studentId,
    },
    {
      gameId,
      studentId,
      gameMetadata,
    },
    { upsert: true }
  )
    .select('gameMetadata')
    .exec();
};

export const getGameMetadata = async ({
  gameId,
  studentId,
}: {
  gameId: Types.ObjectId;
  studentId: Types.ObjectId;
}) => {
  validateMongoID(gameId, 'assets');

  return GameMetadataModel.findOne({
    gameId,
    studentId,
  })
    .select('gameMetadata')
    .lean()
    .exec();
};
