import { NextFunction, Request, Response } from 'express';

import ParentService from '../services/parent.service';

export const getAccountCancellation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    const dataCancellation = await ParentService.findParentAccountCancellation(
      parentId
    );
    const isData = dataCancellation ? dataCancellation.isCancelled : false;
    const isCancelled = dataCancellation ? dataCancellation.isCancelled : false;
    res.status(200).json({ isData, isCancelled });
  } catch (error) {
    next(error);
  }
};

export const setAccountCancellation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentId = req.user.id;
    await ParentService.updateParentAccountCancellation(parentId);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
