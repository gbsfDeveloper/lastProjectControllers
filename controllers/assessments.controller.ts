import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { config } from '../config';
import { ErrorMessage } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import { launchAssessmentRetrieving } from '../services/assessments/assessments.service';
import LogService, {
  MetalogSections,
  MetalogUserEnum,
} from '../services/logs.service';

interface AssessmentRequest extends Request {
  body: {
    subSkillsIds: Types.ObjectId[];
  };
}
// ADD NEW ASSESMENTS WITH IMAGES
export const getAssessment = async (
  req: AssessmentRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subSkillsIds } = req.body;

    if (!subSkillsIds) {
      throw new ValidationError(
        `${ErrorMessage.MISSING_REQUEST_PROP} subSkillsIds`
      );
    }

    const assessment = await launchAssessmentRetrieving(
      subSkillsIds,
      req.user.id,
      false
    );

    // METALOG - STUDENT_INIT_ASSESSMENT
    await LogService.insertOneMetaLog(
      MetalogUserEnum.STUDENT,
      req.user.id,
      MetalogSections.STUDENT_INIT_ASSESSMENT,
      `El estudiante empezo una evaluacion(assessment) que pertenece a las subhabilidades: ${
        subSkillsIds ? subSkillsIds?.toString() : '-noSkillsIds-'
      }`
    );

    const newAssessment = assessment.map((oneAssessment) => {
      if (!oneAssessment.assessmentType) {
        oneAssessment.assessmentType = 'text';
        oneAssessment.sortType = 'list';
      }

      oneAssessment.thumbnail =
        oneAssessment.thumbnail && oneAssessment.thumbnail != ''
          ? `${config.CDN_URL}${oneAssessment.thumbnail}`
          : '';

      oneAssessment.options = oneAssessment.options.map((oneOption) => {
        oneOption.thumbnail =
          oneOption.thumbnail && oneOption.thumbnail != ''
            ? `${config.CDN_URL}${oneOption.thumbnail}`
            : '';

        return oneOption;
      });

      return oneAssessment;
    });

    return res.send(newAssessment);
  } catch (error) {
    next(error);
  }
};
