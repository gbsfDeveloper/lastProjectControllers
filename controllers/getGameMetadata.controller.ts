import { NextFunction, Request, Response } from 'express';

import { getGameMetadata } from '../services/gameMetadata';

export const getGameMetadataController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { gameId },
      user: { id: studentId },
    } = req;

    const { gameMetadata } = (await getGameMetadata({
      // @ts-expect-error It detects it as a string, when it should be an ObjectId, we validate this inside the function.
      gameId,
      studentId,
    })) ?? { gameMetadata: null };

    res.status(200).json({
      gameId,
      gameMetadata,
    });
  } catch (error) {
    next(error);
  }
};
