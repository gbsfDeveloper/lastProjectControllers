import mongoose, { Types } from 'mongoose';

import {
  ErrorMessage,
  parentUserNotFound,
  studentUserNotFound,
} from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import { UTCDate } from '../lib/helpers/generateDates';
import {
  ParentModel,
  Streak,
  Student,
  StudentAssetsFeedbackModel,
  StudentModel,
  StudentPaywallWhitelistModel,
  SubscriptionStatus,
  TrkAsset,
} from '../models';
import { StudentInAppFeedbackModel } from '../models/studentInAppFeedback.model';
import { decodeToken } from './accessManagement';

const resetStreak: Streak = {
  mon: false,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
};

class StudentService {
  async getCompletedLessons(id: Types.ObjectId) {
    return StudentModel.findById(id).select('completedLessons').exec();
  }

  async save(student: Student) {
    return student.save();
  }

  async updateStreakDay(
    studentId: Types.ObjectId,
    day: keyof Streak,
    status = true
  ) {
    return StudentModel.updateOne(
      { _id: studentId },
      { $set: { [`streak.${day}`]: status } }
    );
  }

  async resetAllStudentsStreak() {
    return StudentModel.updateMany(
      {},
      {
        $set: { streak: resetStreak },
      },
      { multi: true }
    );
  }

  async isPremium(id: Types.ObjectId) {
    const student =
      (await StudentModel.findById(id).select('parentId').lean().exec()) ??
      studentUserNotFound();

    if (!student.parentId) return false;

    const parent =
      (await ParentModel.findById(student.parentId)
        .select('subscription')
        .lean()
        .exec()) ?? parentUserNotFound();

    if (!parent.subscription) {
      throw new Error(ErrorMessage.SUBSCRIPTION_NOT_FOUND);
    }

    const isPremiumSubscription =
      parent.subscription.status === SubscriptionStatus.PREMIUM ||
      parent.subscription.status === SubscriptionStatus.TRIAL;

    return isPremiumSubscription;
  }

  async getSuscription(id: Types.ObjectId) {
    const student = await StudentModel.findById(id)
      .select('parentId')
      .lean()
      .exec();

    let parent = null;
    if (student) {
      parent = await ParentModel.findById(student.parentId)
        .select('subscription')
        .lean()
        .exec();
    }

    if (parent) {
      return parent.subscription;
    }

    return {
      status: 'FREEMIUM',
      dueDate: Date.now(),
      isOxxoPaymentPending: false,
      isTrialAvailable: false,
      cadence: 'MONTHLY',
    };
  }

  async registerParent(id: Types.ObjectId, parentToken: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const student =
        (await StudentModel.findById(id).select('parentId').exec()) ??
        studentUserNotFound();

      if (student.parentId) {
        throw new ValidationError(ErrorMessage.STUDENT_LINKED_PARENT);
      }

      const { id: parentId } = decodeToken(parentToken);

      student.parentId = parentId;
      await student.save();

      await ParentModel.updateOne(
        { _id: parentId },
        { $push: { students: student._id } }
      );
      await session.commitTransaction();
      await this.updateStudentToParentActive(student._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateStudentToParentActive(_id: Types.ObjectId) {
    await StudentModel.findOneAndUpdate(
      {
        _id,
      },
      {
        isActiveForParent: true,
      }
    ).exec();
  }

  async getParentIdFromStudentId(id: Types.ObjectId) {
    const student =
      (await StudentModel.findById(id).select('parentId').lean().exec()) ??
      studentUserNotFound();

    return student.parentId;
  }

  async getParentIdFromStudentIdNoError(id: Types.ObjectId) {
    const student = await StudentModel.findById(id)
      .select('parentId')
      .lean()
      .exec();
    if (student) {
      return student.parentId;
    }
    return undefined;
  }

  async updateInAppFeedback(
    studentId: Types.ObjectId,
    recommendToFriend: number,
    _comment: string
  ) {
    await StudentInAppFeedbackModel.findOneAndUpdate(
      {
        studentId,
      },
      {
        recommendToFriend,
        // comment,
      },
      { upsert: true }
    ).exec();
  }

  async updateStudentProfile(_id: Types.ObjectId, student: Partial<Student>) {
    return StudentModel.updateOne({ _id }, student);
  }

  async findStudentByIdGetProfileProps(_id: Types.ObjectId) {
    return (
      StudentModel.findOne({ _id })
        .select('-_id username survey schooling avatar')
        //.lean()
        .exec()
    );
  }

  async getStudentAppFeedback(id: Types.ObjectId, assetId: Types.ObjectId) {
    const studentAppFeedback = await StudentAssetsFeedbackModel.findOne({
      studentId: id,
      assetId,
    })
      .select('isLike isLearn')
      .lean()
      .exec();

    return studentAppFeedback;
  }

  async updateStudentAppFeedback(
    studentId: Types.ObjectId,
    isLike: boolean,
    isLearn: boolean,
    assetId: Types.ObjectId
  ) {
    await StudentAssetsFeedbackModel.findOneAndUpdate(
      {
        studentId: studentId,
      },
      {
        studentId,
        isLike,
        isLearn,
        assetId,
      },
      { upsert: true }
    )
      .select('isLike isLearn')
      .exec();
  }

  async findStudentsManageInfoWithId(_id: Types.ObjectId) {
    return await StudentModel.findOne({ _id, isActiveForParent: true }).select(
      'avatar username streak isActiveForParent'
    );
  }

  async disableStudentsWithId(_id: Types.ObjectId, studentId: Types.ObjectId) {
    if (!mongoose.isValidObjectId(studentId)) {
      throw new ValidationError('Provided student id is invalid.');
    }
    return StudentModel.updateOne(
      { _id, studentId },
      { isActiveForParent: false }
    );
  }

  async findParentInfoWithStudentId(_id: Types.ObjectId) {
    return await StudentModel.findOne({ _id }).select('parentId');
  }

  async findStudentInAppFeedback(studentId: Types.ObjectId) {
    return StudentInAppFeedbackModel.findOne({ studentId }).exec();
  }

  // TRACKING
  async updateLoginTraking(
    studentId: Types.ObjectId,
    typeAsset: string,
    skillId: Types.ObjectId
  ) {
    const newAssetTracking = new TrkAsset({
      studentId,
      typeAsset,
      skillId,
      createdAt: UTCDate(),
    });
    await newAssetTracking.save();
    return newAssetTracking;
  }

  async updateLoginTrakingWithAssetId(
    studentId: Types.ObjectId,
    typeAsset: string,
    skillId: Types.ObjectId,
    assetId: Types.ObjectId
  ) {
    const newAssetTracking = new TrkAsset({
      assetId,
      studentId,
      typeAsset,
      skillId,
      createdAt: UTCDate(),
    });
    await newAssetTracking.save();
    return newAssetTracking;
  }

  async findStudentInfoWithUsername(username: string) {
    return await StudentModel.findOne({ username }).select('username');
  }

  async findStudentOnPaywallWhiteList(studentId: Types.ObjectId) {
    return await StudentPaywallWhitelistModel.findOne({ studentId }).select(
      'studentId listVersion paywallGroup paywallCatalogId'
    );
  }

  async getStudentPaywallInfoWhiteList(studentId: Types.ObjectId) {
    return await StudentPaywallWhitelistModel.findOne({ studentId }).select(
      'paywallGroup paywallCatalogId'
    );
  }

  async getPaymentParams(id: Types.ObjectId) {
    const student = await StudentModel.findById(id)
      .select('parentId')
      .lean()
      .exec();

    let parent = null;
    if (student) {
      parent = await ParentModel.findById(student.parentId)
        .select(
          'subscription relatedGooglePurchaseTokens appleOriginalTransactionId'
        )
        .lean()
        .exec();
    }

    if (parent) {
      return {
        subscription: parent.subscription,
        relatedGooglePurchaseTokens: parent.relatedGooglePurchaseTokens,
        appleOriginalTransactionId: parent.appleOriginalTransactionId,
      };
    }

    return {
      subscription: {
        status: 'FREEMIUM',
        dueDate: Date.now(),
        isOxxoPaymentPending: false,
        isTrialAvailable: false,
        cadence: 'MONTHLY',
      },
      relatedGooglePurchaseTokens: [],
      appleOriginalTransactionId: undefined,
    };
  }
}

export default new StudentService();
