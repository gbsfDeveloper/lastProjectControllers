import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { config } from '../config';
import { launchRecordSaving } from '../services/assessmentRecords.service';

interface RecordsRequest extends Request {
  body: {
    records: {
      assessmentId: Types.ObjectId;
      relatedSubSkillsId: Types.ObjectId[];
    }[];
  };
}

export async function saveRecord(
  req: RecordsRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { records } = req.body;
    const { id } = req.user;

    await launchRecordSaving(id.toString(), records);

    return res.status(204).send(config.STATUS_OK);
  } catch (error) {
    next(error);
  }
}
