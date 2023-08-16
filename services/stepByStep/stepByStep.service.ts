import { Types } from 'mongoose';

import { noRecordFound } from '../../lib/errors';
import { validateMongoID } from '../../lib/helpers/validateMongoID';
import { StepByStepModel } from '../../models/stepByStep.model';
import { StepByStepSurveyModel } from '../../models/stepByStepSurvey.model';

const SELECTED_STEPBYSTEP = '62f187b0c09d2b8bba17df10';

export const findStepByStepById = async (stepByStepId: string) => {
  validateMongoID(stepByStepId, 'stepByStep');

  return (
    (await StepByStepModel.findById(stepByStepId)
      .sort({ 'steps.stepOrder': 1 })
      .select('relatedSubSkillsId steps')
      .lean()
      .exec()) ?? noRecordFound('stepByStep')
  );
};

const _findSelectedStepByStepById = async () => {
  return (
    (await StepByStepModel.findById(SELECTED_STEPBYSTEP)
      .select('relatedSubSkillsId steps')
      .lean()
      .exec()) ?? noRecordFound('stepByStep')
  );
};

export const getStudentsStepByStepSurvey = async (
  studentId: Types.ObjectId,
  stepByStepId: string
) => {
  return await StepByStepSurveyModel.findOne({ studentId, stepByStepId });
};

export const saveSurveyResponse = async (
  studentId: Types.ObjectId,
  stepByStepId: string,
  isWork: boolean
) => {
  await StepByStepSurveyModel.findOneAndUpdate(
    {
      studentId,
      stepByStepId,
    },
    {
      studentId,
      stepByStepId,
      isWork,
    },
    { upsert: true }
  ).exec();
};
