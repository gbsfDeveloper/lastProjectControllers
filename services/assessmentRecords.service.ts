import {
  FilterQuery,
  isValidObjectId,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';

import { ErrorMessage } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import {
  AssessmentRecord,
  AssessmentRecordModel,
} from '../models/assessmentRecord.model';

type record = {
  assessmentId: Types.ObjectId;
  relatedSubSkillsId: Types.ObjectId[];
};

async function upsertRecord(
  studentId: string,
  assessmentId: Types.ObjectId,
  relatedSubSkillsId: Types.ObjectId[]
) {
  const filter: FilterQuery<AssessmentRecord> = {
    _id: { $eq: studentId },
  };

  const updatePredicate: UpdateQuery<AssessmentRecord> = {
    $addToSet: {
      completedAssessments: {
        relatedSubSkillsId: relatedSubSkillsId,
        assessmentId: assessmentId,
      },
    },
  };

  const options: QueryOptions<AssessmentRecord> = { upsert: true };

  return AssessmentRecordModel.findOneAndUpdate(
    filter,
    updatePredicate,
    options
  )
    .lean()
    .exec();
}

export async function launchRecordSaving(studentId: string, records: record[]) {
  const filteredAssessments = records.filter((record) =>
    isValidObjectId(record.assessmentId)
  );

  if (!filteredAssessments.length) {
    throw new ValidationError(ErrorMessage.INVALID_MONGO_ID);
  }

  const upsertRecordPromises = filteredAssessments.map(async (assessment) =>
    upsertRecord(
      studentId,
      assessment.assessmentId,
      assessment.relatedSubSkillsId
    )
  );

  return Promise.all(upsertRecordPromises);
}
