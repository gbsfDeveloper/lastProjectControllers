import { Types } from 'mongoose';

import { config } from '../../config';
import { UTCDate } from '../../lib/helpers/generateDates';
import { RankingModel } from '../../models';
import { SurveyBannersCatalogueModel } from '../../models/surveyBannersCatalogue.model';
import {
  ButtonOptions,
  SurveyFormsModel,
  SurveyOptions,
  WeNeedYouSection,
  WhoIAmSection,
} from '../../models/surveyForms.model';
import { SurveyFormsResponseModel } from '../../models/surveyFormsResponse.model';
import {
  SurveyQuestionsAnswers,
  SurveyQuestionsAnswersModel,
} from '../../models/surveyQuestionsAnswers.model';
import { SurveyUserBannerModel } from '../../models/surveyUserBanner.model';
import { WeNeedYouFormResponseModel } from '../../models/weNeedYouFormResponse.model';

export const getOneBannerWithId = async (bannerId: Types.ObjectId) => {
  return SurveyBannersCatalogueModel.findOne({ _id: bannerId }).select('-_id');
};

export const getShowBannerWithUserId = async (userId: Types.ObjectId) => {
  return SurveyUserBannerModel.findOne({ userId, show: true, visited: false });
};

export const getAllBannersWithUserId = async (userId: Types.ObjectId) => {
  const userBannersIds = await SurveyUserBannerModel.find({
    userId,
    show: true,
    visited: false,
  }).select('-_id bannerId');
  const banners = await Promise.all(
    userBannersIds.map(async (element) => {
      const banner = await getOneBannerWithId(element.bannerId);
      if (banner) {
        banner.imageLeft = `${config.CDN_URL}${banner.imageLeft}`;
        banner.imageRight = `${config.CDN_URL}${banner.imageRight}`;
      }
      return banner;
    })
  );
  return banners.filter((element) => {
    return element != null;
  });
};

export const getOneSurveyFormWithBannerId = async (
  bannerId: Types.ObjectId
) => {
  const bannerCatalogInfo = await SurveyBannersCatalogueModel.findOne({
    _id: bannerId,
  });

  let surveyInfo = null;
  let questionsSection: Array<SurveyQuestionsAnswers | null> = [];

  if (bannerCatalogInfo && bannerCatalogInfo.surveyFormId) {
    const surveyId = bannerCatalogInfo.surveyFormId;
    surveyInfo = await SurveyFormsModel.findOne({ _id: surveyId });
    if (surveyInfo) {
      const questionSection = surveyInfo.questionsSection;
      const buildQuestions = await Promise.all(
        questionSection.map(async (element) => {
          const questions = await SurveyQuestionsAnswersModel.findOne({
            _id: element.questionId,
          });
          return questions;
        })
      );
      surveyInfo.questionsSection = [];
      questionsSection = buildQuestions.filter((element) => {
        return element != null;
      });
    }
  }

  return { ...surveyInfo, questionsSection };
};

export const getOneSurveyFormWithId = async (_id: Types.ObjectId) => {
  let questionsSection: Array<SurveyQuestionsAnswers | null> = [];
  const surveyInfo = await SurveyFormsModel.findById({ _id }).select(
    '-surveyOptions._id -weNeedYouSection._id -button._id'
  );
  if (surveyInfo) {
    const questionSection = surveyInfo.questionsSection;
    const buildQuestions = await Promise.all(
      questionSection.map(async (element) => {
        const questions = await SurveyQuestionsAnswersModel.findOne({
          _id: element.questionId,
        });
        return questions;
      })
    );
    surveyInfo.questionsSection = [];
    questionsSection = buildQuestions.filter((element) => {
      return element != null;
    });
  }

  let response = createDefaultSurveyResponse();
  if (surveyInfo) {
    response = {
      surveyOptions: surveyInfo.surveyOptions,
      topImageSection: surveyInfo.topImageSection,
      whoIAmSection: surveyInfo.whoIAmSection,
      questionsSection,
      weNeedYouSection: surveyInfo.weNeedYouSection,
      button: surveyInfo.button,
    };
    response.topImageSection = `${config.CDN_URL}${response.topImageSection}`;
    const verifyWhoIAmSection: WhoIAmSection[] = [];
    for (const element of response.whoIAmSection) {
      verifyWhoIAmSection.push({
        image: `${config.CDN_URL}${element.image}`,
        text: element.text,
      });
    }
    response.whoIAmSection = verifyWhoIAmSection;
  }

  return response;
};

export const createDefaultSurveyResponse = () => {
  const defaultResponse: {
    surveyOptions: SurveyOptions;
    topImageSection: string;
    whoIAmSection: WhoIAmSection[];
    questionsSection: (SurveyQuestionsAnswers | null)[];
    weNeedYouSection: WeNeedYouSection;
    button: ButtonOptions;
  } = {
    surveyOptions: {
      surveyBackgroundColor: '',
      surveyFontColor: '',
    },
    topImageSection: '',
    whoIAmSection: [],
    questionsSection: [],
    weNeedYouSection: {
      whoShow: [],
      title: '',
      text: '',
      showEmail: false,
      showPhone: false,
    },
    button: {
      text: '',
      backgroundColor: '',
      fontColor: '',
    },
  };

  return defaultResponse;
};

export const saveSurveyFormResponses = async (
  userId: Types.ObjectId,
  userType: string,
  surveyFormId: Types.ObjectId,
  questionsSectionId: Types.ObjectId,
  questionsSectionResponses: string[],
  comment: string
) => {
  const newResponseDocument = new SurveyFormsResponseModel({
    userId,
    userType,
    surveyFormId,
    questionsSectionId,
    questionsSectionResponses,
    comment,
  });
  await newResponseDocument.save();
};

export const saveWeNeedYouFormResponses = async (
  userId: Types.ObjectId,
  userType: string,
  weNeedYouSectionEmail: string,
  weNeedYouSectionPhone: string
) => {
  const newResponseDocument = new WeNeedYouFormResponseModel({
    userId,
    userType,
    weNeedYouSectionEmail,
    weNeedYouSectionPhone,
  });
  await newResponseDocument.save();
};

export const saveBannerStatus = async (
  surveyFormId: Types.ObjectId,
  userId: Types.ObjectId,
  visited: boolean
) => {
  const bannersArray = await SurveyUserBannerModel.find({
    userId,
    visited: false,
  }).select('bannerId');
  for (const bannerElement of bannersArray) {
    const bannerId = bannerElement.bannerId;
    const bannerCatalogInfo = await SurveyBannersCatalogueModel.findOne({
      _id: bannerId,
    }).select('surveyFormId');
    if (bannerCatalogInfo && bannerCatalogInfo.surveyFormId == surveyFormId) {
      await SurveyUserBannerModel.updateOne(
        { userId, bannerId },
        { visited, $push: { showDate: UTCDate() } }
      );
    }
  }
};

export const addtestPoints = async (
  studentId: Types.ObjectId,
  testPoints: number
) => {
  const testPointsInfo = await RankingModel.findOne({ studentId })
    .select('weektestPoints')
    .exec();

  if (testPointsInfo) {
    testPointsInfo.weektestPoints += testPoints;
    await testPointsInfo.save();
  } else {
    await RankingModel.create({
      studentId,
      rankingPlace: 0,
      weektestPoints: testPoints,
      totaltestPoints: testPoints,
    });
  }
};
