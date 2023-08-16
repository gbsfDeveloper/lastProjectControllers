import { DateTime } from 'luxon';
import { Types } from 'mongoose';

import { config } from '../../config';
import {
  ErrorMessage,
  noRecordFound,
  parentUserNotFound,
} from '../../lib/errors';
import ValidationError from '../../lib/errors/ValidationError';
import { UTCDate } from '../../lib/helpers/generateDates';
import { logger } from '../../lib/logger';
import {
  ParentModel,
  PaymentRecordModel,
  SubscriptionPlatforms,
  SubscriptionStatus,
} from '../../models';
import { StorePricesModel } from '../../models/storePrices.model';
import HubspotService from '../hubspot.service';
import LogService from '../logs.service';
import { googleNotificationTypes } from './helper';

export function calculateAddedTime(suscriptionDueDateTime: number) {
  return { days: suscriptionDueDateTime };
}

async function savePaymentRecord(
  parentId: Types.ObjectId,
  purchaseToken: string,
  cadence: string,
  dueDate: DateTime,
  amount: string,
  appVersion?: string | undefined
) {
  await LogService.insertPaymentLog(SubscriptionStatus.PREMIUM, parentId);

  const paymentRecordDetails = {
    subscriptionPlatform: SubscriptionPlatforms.PLAY_STORE,
    parentId,
    subscriptionDetails: {
      amount,
      cadence,
      dueDate,
      transactionId: purchaseToken,
      transactionDate: new Date().toISOString(),
      appVersion: typeof appVersion === 'string' ? appVersion : undefined,
    },
  };

  await new PaymentRecordModel(paymentRecordDetails).save();
}

export async function updateParentSubscriptionStatus(
  parentId: Types.ObjectId,
  purchaseToken: string,
  productId: string,
  appVersion: string | undefined
) {
  if (typeof purchaseToken !== 'string') {
    throw new ValidationError(ErrorMessage.INVALID_PLAY_STORE_PURCHASE_TOKEN);
  }
  if (typeof productId !== 'string') {
    throw new ValidationError(ErrorMessage.INVALID_PRODUCT_ID);
  }

  logger.debug('FUNC.updateParentSubscriptionStatus - INFO');
  logger.debug({ parentId, productId, purchaseToken });

  const notificationType = 4;

  const notificationEquivalent = googleNotificationTypes.find(
    (notification) => notification.notificationTypeId === notificationType
  );

  if (notificationEquivalent) {
    const subscription = await StorePricesModel.findOne({
      priceStoreId: productId,
      relatedStore: 'PLAYSTORE',
    });

    if (!subscription) {
      throw new Error(ErrorMessage.PLAY_STORE_SUBSCRIPTIONTYPE_NOT_FOUND);
    }

    const parent =
      (await ParentModel.findOne({ _id: { $eq: parentId } })
        .select('subscription students relatedGooglePurchaseTokens email')
        .exec()) ?? parentUserNotFound();

    const addedTime = calculateAddedTime(subscription.priceDuration);

    const targetDueDate = DateTime.now()
      .plus(addedTime)
      .toISODate() as unknown as DateTime;

    parent.subscription.isTrialAvailable = false;
    parent.subscription.status = notificationEquivalent.equivalentStatus;
    parent.subscription.dueDate = targetDueDate;
    parent.subscription.cadence = subscription.priceName;
    parent.subscription.platform = SubscriptionPlatforms.PLAY_STORE;

    if (!parent.relatedGooglePurchaseTokens.includes(purchaseToken)) {
      parent.relatedGooglePurchaseTokens.push(purchaseToken);
    }

    await parent.save();

    // save payment Record
    await savePaymentRecord(
      parentId,
      purchaseToken,
      subscription.priceName,
      targetDueDate,
      subscription.priceStoreAmount,
      appVersion
    );

    // HUBSPOT
    if (config.NODE_ENV !== 'development') {
      logger.debug('INIT_HUBSPOT_EVENT');
      try {
        const utcTime = UTCDate().getTime();
        const hours = 6;
        const hourToMiliseconds = hours * 60 * 60000;
        // Payment Event
        HubspotService.savePaymentEvent({
          transaction_id: purchaseToken,
          store_status: SubscriptionStatus.PREMIUM,
          store: SubscriptionPlatforms.PLAY_STORE,
          purchase_date: new Date(utcTime - hourToMiliseconds).toLocaleString(),
          product_id: subscription ? subscription.priceStoreId : '',
          user_id: parent._id.toString(),
          user_email: parent.email,
        });
        // Payment Plan
        HubspotService.savePaymentPlanEvent(
          {
            user_id: parent._id.toString(),
            created_at: new Date(utcTime - hourToMiliseconds).toLocaleString(),
            user_email: parent.email,
          },
          subscription ? subscription.priceStoreId : ''
        );
      } catch (error) {
        logger.debug(error);
      }
      logger.debug('END_HUBSPOT_EVENT');
    }
  } else {
    noRecordFound('googleNotification');
  }
}
