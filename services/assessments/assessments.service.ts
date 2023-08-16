import { isValidObjectId, Types } from 'mongoose';

import { ErrorMessage } from '../../lib/errors';
import ValidationError from '../../lib/errors/ValidationError';
import { genRandomNumber } from '../../lib/helpers/genRandomNumber';
import { validateMongoID } from '../../lib/helpers/validateMongoID';
import { logger } from '../../lib/logger';
import {
  Assessment,
  AssessmentModel,
  DifficultyEnum,
} from '../../models/assessment.model';
import { AssessmentRecordModel } from '../../models/assessmentRecord.model';

type sanitizedQuestions = Pick<Assessment, 'difficulty' | 'question'> & {
  options: { _id: Types.ObjectId; content: string; thumbnail: string }[];
  assessmentType: string;
  sortType: string;
  thumbnail: string;
};

export enum NumberOfQuestions {
  ASSESSMENT = 3,
  WEEKLY_ASSESSMENT = 6,
}

const weeklyAssessmentPossibilities: Array<DifficultyEnum> = [
  DifficultyEnum.EASY,
  DifficultyEnum.EASY,
  DifficultyEnum.MEDIUM,
  DifficultyEnum.MEDIUM,
  DifficultyEnum.HARD,
  DifficultyEnum.HARD,
];

const assessmentPossibilities: Array<DifficultyEnum> = [
  DifficultyEnum.EASY,
  DifficultyEnum.MEDIUM,
  DifficultyEnum.HARD,
];

function allDifficultiesFound(
  rawQuestions: sanitizedQuestions[],
  difficultyPossibilities: DifficultyEnum[]
) {
  const auxiliaryQuestions = Array.from(rawQuestions);
  for (const currentDifficulty of difficultyPossibilities) {
    const currentDifficultyIndex = auxiliaryQuestions.findIndex(
      (question) => question.difficulty === currentDifficulty
    );
    const containsDifficulty = currentDifficultyIndex !== -1;
    if (!containsDifficulty) {
      auxiliaryQuestions.splice(currentDifficultyIndex, 1);
      return false;
    }
  }
  return true;
}

function selectRandomQuestions(
  rawQuestions: Array<sanitizedQuestions>,
  isWeekly = false
) {
  const difficultyPossibilities = isWeekly
    ? [...weeklyAssessmentPossibilities]
    : [...assessmentPossibilities];

  const allDifficultiesWereFound = allDifficultiesFound(
    rawQuestions,
    difficultyPossibilities
  );

  if (!allDifficultiesWereFound) {
    return rawQuestions.slice(0, difficultyPossibilities.length);
  }

  const finalQuestions = [];
  while (difficultyPossibilities.length > 0) {
    const max = rawQuestions.length - 1;
    const min = 0;
    const random = genRandomNumber(min, max);
    const currentDifficulty = rawQuestions[random].difficulty as DifficultyEnum;
    if (difficultyPossibilities.includes(currentDifficulty)) {
      finalQuestions.push(rawQuestions[random]);
      const difficultyIndex = difficultyPossibilities.findIndex(
        (difficult) => difficult === currentDifficulty
      );
      rawQuestions.splice(random, 1);
      difficultyPossibilities.splice(difficultyIndex, 1);
    }
  }
  return finalQuestions;
}

async function retrieveBaseAssessmentQuestions(
  relatedSubSkillsId: Array<Types.ObjectId>,
  respondedQuestionsIds: Array<Types.ObjectId>
) {
  return AssessmentModel.find({
    _id: { $nin: respondedQuestionsIds },
    relatedSubSkillsId: { $in: relatedSubSkillsId },
    isActive: true,
  })
    .select(
      '_id question relatedSubSkillsId difficulty options assessmentType sortType thumbnail'
    )
    .lean()
    .exec();
}

async function getAssessmentQuestions(
  relatedSubSkillsId: Array<Types.ObjectId>,
  studentId: Types.ObjectId,
  isWeekly: boolean
) {
  const questionsAmount = isWeekly
    ? NumberOfQuestions.WEEKLY_ASSESSMENT
    : NumberOfQuestions.ASSESSMENT;

  const respondedQuestions = await AssessmentRecordModel.findOne({
    _id: { $eq: studentId.toString() },
    'completedAssessments.relatedSubSkillsId': { $in: relatedSubSkillsId },
  })
    .select('-_id -__v')
    .lean()
    .exec();

  const respondedQuestionsIds: Array<Types.ObjectId> =
    respondedQuestions?.completedAssessments.map(
      ({ assessmentId }) => assessmentId
    ) ?? [];

  const preliminaryQuestions = await retrieveBaseAssessmentQuestions(
    relatedSubSkillsId,
    respondedQuestionsIds
  );

  if (preliminaryQuestions.length < questionsAmount) {
    logger.debug(
      `Removing all assessment records from student: ${
        studentId as unknown as string
      } and provided sub skills ids.`
    );
    await AssessmentRecordModel.deleteMany({
      _id: { $eq: studentId.toString() },
      relatedSubSkillsId: { $in: relatedSubSkillsId },
    });
    return retrieveBaseAssessmentQuestions(relatedSubSkillsId, []);
  }
  return preliminaryQuestions;
}

export async function launchAssessmentRetrieving(
  rawSubSkillsIds: Array<Types.ObjectId>,
  studentId: Types.ObjectId,
  isWeekly = false
) {
  validateMongoID(studentId, 'student');

  const numberOfDesiredQuestions = isWeekly
    ? NumberOfQuestions.WEEKLY_ASSESSMENT
    : NumberOfQuestions.ASSESSMENT;

  const validSubSkillsIds = rawSubSkillsIds.filter(isValidObjectId);

  if (!validSubSkillsIds.length) {
    throw new ValidationError(`${ErrorMessage.INVALID_VALUE} subskills`);
  }

  const questions = await getAssessmentQuestions(
    validSubSkillsIds,
    studentId,
    isWeekly
  );

  if (!questions.length) {
    return getRandomAssessments();
  }

  if (questions.length && questions.length < numberOfDesiredQuestions) {
    return questions;
  }

  return selectRandomQuestions(questions, isWeekly);
}

export const getRandomAssessments = async () => {
  const easy = await AssessmentModel.find({
    difficulty: 'EASY',
    isActive: true,
  })
    .limit(2)
    .lean()
    .exec();

  const medium = await AssessmentModel.find({
    difficulty: 'MEDIUM',
    isActive: true,
  })
    .limit(2)
    .lean()
    .exec();

  const hard = await AssessmentModel.find({
    difficulty: 'HARD',
    isActive: true,
  })
    .limit(2)
    .lean()
    .exec();

  return [...easy, ...medium, ...hard];
};
