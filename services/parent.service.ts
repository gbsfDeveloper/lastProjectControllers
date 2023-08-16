import { DateTime } from 'luxon';
import { Types, UpdateQuery } from 'mongoose';

import { config } from '../config';
import {
  ParentPushInfo,
  sendPushNotificationsImproved,
} from '../controllers/pushNotifications.controller';
import { ErrorMessage, parentUserNotFound } from '../lib/errors';
import ValidationError from '../lib/errors/ValidationError';
import { UTCDate } from '../lib/helpers/generateDates';
import { validateMongoID } from '../lib/helpers/validateMongoID';
import { logger } from '../lib/logger';
import {
  AccountCancellationModel,
  DevicePushTokenModel,
  Parent,
  ParentInAppFeedbackModel,
  ParentModel,
  ParentTipModel,
  PaymentRecordModel,
  Subscription,
  SubscriptionPlatforms,
  SubscriptionStatus,
  TrkDeviceIdModel,
  TrkLoginModel,
} from '../models';
import { ParentPaywallWhitelistModel } from '../models/parentPaywallWhiteList.model';
import LogService from './logs.service';

class ParentService {
  // This method returns the model instead of a plain object
  async findModel(_id: Types.ObjectId) {
    return ParentModel.findOne({ _id })
      .select('appleOriginalTransactionId email subscription')
      .exec();
  }

  async updateSubscription({
    parentId,
    subscriptionCadence,
    subscriptionPlatform,
    subscriptionStatus,
    amount,
    transactionId,
    appVersion,
    priceDuration,
  }: {
    parentId: Types.ObjectId;
    subscriptionCadence: string;
    subscriptionPlatform: `${SubscriptionPlatforms}`;
    subscriptionStatus: `${SubscriptionStatus}`;
    amount: string;
    transactionId: string;
    appVersion: string | undefined;
    priceDuration: number | undefined;
  }) {
    const subscriptionLength = priceDuration
      ? { days: priceDuration }
      : { days: 1 };

    const subscriptionDueDate: Date | DateTime = DateTime.now()
      .plus(subscriptionLength)
      .toISODate() as unknown as DateTime;

    const subscription: Subscription = {
      platform: subscriptionPlatform,
      cadence: subscriptionCadence,
      isOxxoPaymentPending: false,
      status: subscriptionStatus,
      dueDate: subscriptionDueDate,
      isTrialAvailable: false,
    };

    logger.debug(subscription);

    const parent =
      (await ParentModel.findOne({ _id: parentId })
        .select('subscription students')
        .exec()) ?? parentUserNotFound();

    parent.subscription = subscription;

    await parent.save();

    await PaymentRecordModel.create({
      subscriptionPlatform,
      parentId,
      subscriptionDetails: {
        amount,
        cadence: subscriptionCadence,
        transactionId,
        dueDate: subscriptionDueDate,
        transactionDate: DateTime.now().toISODate().toString(),
        appVersion: typeof appVersion === 'string' ? appVersion : undefined,
      },
    });

    await LogService.insertPaymentLog(subscriptionStatus, parentId);

    return true;
  }

  async paymentHistory(id: Types.ObjectId) {
    return PaymentRecordModel.find({ parentId: id })
      .select('subscriptionPlatform subscriptionDetails')
      .lean()
      .exec();
  }

  async updateNotification(_id: Types.ObjectId, notifications: boolean) {
    return ParentModel.updateOne({ _id }, { notifications });
  }

  async updateUsername(_id: Types.ObjectId, username: string) {
    return ParentModel.updateOne({ _id }, { username });
  }

  async updateParentProfile(_id: Types.ObjectId, parent: Partial<Parent>) {
    return ParentModel.updateOne({ _id }, parent);
  }

  async createPaymentRecord(
    _id: Types.ObjectId,
    subscriptionPlatform: SubscriptionPlatforms,
    subscriptionDetails: Record<string, string | number | Date | DateTime>
  ) {
    return PaymentRecordModel.create({
      subscriptionPlatform: subscriptionPlatform,
      subscriptionDetails: subscriptionDetails,
      parentId: _id,
    });
  }

  async isPremium(id: Types.ObjectId) {
    const parent =
      (await ParentModel.findById(id).select('subscription').lean().exec()) ??
      parentUserNotFound();

    if (!parent.subscription) {
      throw new Error(ErrorMessage.SUBSCRIPTION_NOT_FOUND);
    }

    const isPremiumSubscription =
      parent.subscription.status === SubscriptionStatus.PREMIUM ||
      parent.subscription.status === SubscriptionStatus.TRIAL
        ? true
        : false;

    return isPremiumSubscription;
  }

  async findParentByIdGetProfileProps(_id: Types.ObjectId) {
    return ParentModel.findOne({ _id })
      .select(
        '-_id email numberOfKids username phoneNumber userFullName userNames userLastNames'
      )
      .lean()
      .exec();
  }

  async findParentEmailWithId(_id: Types.ObjectId) {
    return ParentModel.findOne({ _id }).select('email').lean().exec();
  }

  async isParent(_id: Types.ObjectId) {
    validateMongoID(_id, 'parentId');

    return ParentModel.exists({ _id });
  }

  async resetExpiredSubscriptions() {
    const today = DateTime.now().toISODate();

    const filter = {
      'subscription.status': {
        $in: [SubscriptionStatus.PREMIUM, SubscriptionStatus.TRIAL],
      },
      'subscription.dueDate': {
        $lt: today,
      },
    };

    const updatePredicate: UpdateQuery<Subscription> = {
      $set: {
        'subscription.status': SubscriptionStatus.FREEMIUM,
        'subscription.dueDate': config.FREEMIUM_DUE_DATE,
      },
    };

    return ParentModel.updateMany(filter, updatePredicate, { upsert: false });
  }

  async subscriptionInfo(parentId: Types.ObjectId) {
    const parent =
      (await ParentModel.findById(parentId)
        .select(
          'subscription appleOriginalTransactionId relatedGooglePurchaseTokens'
        )
        .exec()) ?? parentUserNotFound();

    return parent;
  }

  async updatePasswordParent(_id: Types.ObjectId, password: string) {
    return ParentModel.updateOne({ _id }, { password });
  }

  findParentByAppleOriginalTransactionId(
    appleOriginalTransactionId: string | undefined
  ) {
    if (appleOriginalTransactionId === undefined) {
      throw new ValidationError(ErrorMessage.APP_STORE_MISSING_TRANSACTION_ID);
    }

    return ParentModel.findOne({ appleOriginalTransactionId })
      .select('students')
      .exec();
  }

  async findParentStudentsWithId(_id: Types.ObjectId) {
    const parent = await ParentModel.findOne({ _id }).select(
      'students username suscription'
    );
    if (!parent) throw new ValidationError('No parent found', 404);
    return parent;
  }

  async findParentDailyTips(todayDate: string) {
    return ParentTipModel.findOne({ appearDate: todayDate, isActive: true })
      .select('-_id tipTitle tipBody')
      .exec();
  }

  terminateTrialAvailability(_id: Types.ObjectId) {
    return ParentModel.updateOne(
      { _id },
      { $set: { 'subscription.isTrialAvailable': false } }
    );
  }

  async updateInAppFeedback(
    parentId: Types.ObjectId,
    recommendToFriend: number,
    isEasyToUse: boolean,
    areMyKidsLearn: boolean,
    doYouLikeTopics: boolean,
    comment: string
  ) {
    await ParentInAppFeedbackModel.findOneAndUpdate(
      {
        parentId,
      },
      {
        recommendToFriend,
        isEasyToUse,
        areMyKidsLearn,
        doYouLikeTopics,
        comment,
      },
      { upsert: true }
    ).exec();
  }

  async findParentInAppFeedback(parentId: Types.ObjectId) {
    return ParentInAppFeedbackModel.findOne({ parentId }).exec();
  }

  async findParentAccountCancellation(parentId: Types.ObjectId) {
    return AccountCancellationModel.findOne({ parentId }).exec();
  }

  async updateParentAccountCancellation(parentId: Types.ObjectId) {
    return AccountCancellationModel.updateOne(
      { parentId },
      { $set: { isCancelled: true } },
      { upsert: true }
    );
  }

  async updatePushNotificationsToken(
    parentId: Types.ObjectId,
    pushDeviceToken: string
  ) {
    return DevicePushTokenModel.updateOne(
      { parentId },
      { $set: { parentId: parentId, pushDeviceToken: pushDeviceToken } },
      { upsert: true }
    );
  }

  async getPushNotificationsToken(parentId: Types.ObjectId) {
    return DevicePushTokenModel.findOne({ parentId }).select('pushDeviceToken');
  }

  // TRACKING
  async updateLoginTraking(parentId: Types.ObjectId) {
    const newTracking = new TrkLoginModel({ parentId, createdAt: UTCDate() });
    await newTracking.save();
    return newTracking;
  }

  // TRACKING
  async updateDeviceIdTracking(parentId: Types.ObjectId, deviceId: string) {
    const newTracking = new TrkDeviceIdModel({
      parentId,
      deviceId,
      createdAt: UTCDate(),
    });
    await newTracking.save();
    return newTracking;
  }

  async getAllPushNotificationsTokens() {
    return DevicePushTokenModel.find().select('parentId pushDeviceToken');
  }

  processParentInfo = async (
    parentInfo: (Parent &
      Required<{
        _id: Types.ObjectId;
      }>)[]
  ) => {
    const parentInfoPush = await Promise.all(
      parentInfo.map(async (parentSingleInfo: Parent) => {
        const parentId = parentSingleInfo._id;
        const [paymentPushInfo, devicePushInfo, whiteListPushInfo] =
          await Promise.all([
            PaymentRecordModel.find({ parentId })
              .sort({ createdAt: -1 })
              .limit(1),
            DevicePushTokenModel.find({ parentId }).limit(1),
            ParentPaywallWhitelistModel.find({ parentId }).limit(1),
          ]);
        return {
          _id: parentId,
          email: parentSingleInfo.email,
          password: parentSingleInfo.password,
          phoneNumber: parentSingleInfo.phoneNumber,
          username: parentSingleInfo.username,
          avatar: parentSingleInfo.avatar,
          isTermsAndConditionsAccepted:
            parentSingleInfo.isTermsAndConditionsAccepted,
          parentSession: parentSingleInfo.parentSession,
          isEmailVerified: parentSingleInfo.isEmailVerified,
          students: parentSingleInfo.students,
          subscription: parentSingleInfo.subscription,
          numberOfKids: parentSingleInfo.numberOfKids,
          uid: parentSingleInfo.uid,
          notifications: parentSingleInfo.notifications,
          userFullName: parentSingleInfo.userFullName,
          studentsInfo: parentSingleInfo.studentsInfo,
          appleOriginalTransactionId:
            parentSingleInfo.appleOriginalTransactionId,
          relatedGooglePurchaseTokens:
            parentSingleInfo.relatedGooglePurchaseTokens,
          userNames: parentSingleInfo.userNames,
          userLastNames: parentSingleInfo.userLastNames,
          createdAt: parentSingleInfo.createdAt,
          updatedAt: parentSingleInfo.updatedAt,
          pushInfoArray: devicePushInfo,
          paymentRecordsArray: paymentPushInfo,
          parentWhiteListArray: whiteListPushInfo,
        };
      })
    );

    await sendPushNotificationsImproved(parentInfoPush);
  };

  async getParentPushNotificationInfoImproved() {
    const parentInfo = await ParentModel.find({
      parentSession: true,
    })
      .lean()
      .cursor()
      .eachAsync(
        async (batch) => {
          await this.processParentInfo(batch);
        },
        { parallel: 100, batchSize: 500 }
      );
    return parentInfo;
  }

  async getParentPushNotificationInfo(): Promise<ParentPushInfo[]> {
    return ParentModel.aggregate([
      {
        $match: { parentSession: true },
      },
      {
        $lookup: {
          from: 'devicepushtokens', // collection name in db
          localField: '_id',
          foreignField: 'parentId',
          as: 'pushInfoArray',
        },
      },
      {
        $lookup: {
          from: 'paymentRecords', // collection name in db
          localField: '_id',
          foreignField: 'parentId',
          as: 'paymentRecordsArray',
          pipeline: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'parentPaywallWhitelists', // collection name in db
          localField: '_id',
          foreignField: 'parentId',
          as: 'parentWhiteListArray',
        },
      },
    ]);
  }

  async getParentLoginInfo(parentId: Types.ObjectId) {
    return TrkLoginModel.findOne({ parentId }).select('createdAt');
  }

  async findParentActiveLogin(_id: Types.ObjectId) {
    const parent = await ParentModel.findOne({ _id }).select('parentSession');
    return parent;
  }

  async findParentStudentsWithIdNoError(_id: Types.ObjectId) {
    const parent = await ParentModel.findOne({ _id }).select(
      'students username'
    );
    return parent;
  }

  async findParentInfoWithUsername(username: string) {
    const parent = await ParentModel.findOne({ username }).select('username');
    return parent;
  }

  async findParentOnPaywallWhiteList(parentId: Types.ObjectId) {
    return await ParentPaywallWhitelistModel.findOne({ parentId }).select(
      'parentId'
    );
  }

  async getParentPaywallInfoWhiteList(parentId: Types.ObjectId) {
    return await ParentPaywallWhitelistModel.findOne({ parentId }).select(
      'paywallCatalogId paywallGroup'
    );
  }

  async findParentPremiumInfo(parentId: Types.ObjectId | undefined) {
    if (!parentId) return null;
    return ParentModel.findOne({ _id: parentId }).select(
      'subscription appleOriginalTransactionId relatedGooglePurchaseTokens students email username'
    );
  }

  async getSuscription(id: Types.ObjectId) {
    const parentInfo = await ParentModel.findById(id)
      .select('subscription')
      .lean()
      .exec();

    if (parentInfo) {
      return parentInfo.subscription;
    }

    return {
      status: 'FREEMIUM',
      dueDate: Date.now(),
      isOxxoPaymentPending: false,
      isTrialAvailable: false,
      cadence: 'MONTHLY',
    };
  }
}

export default new ParentService();
