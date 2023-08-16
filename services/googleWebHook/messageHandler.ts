import { Message } from '@google-cloud/pubsub';

import { logger } from '../../lib/logger';
import { googleSubscriptionNotificationModel } from '../../models/googlePurchaseNotification.model';

type googleNotification = {
  version: string;
  packageName: string;
  eventTimeMillis: string;
  subscriptionNotification: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    subscriptionId: string;
  };
};

export async function saveNotification(message: googleNotification) {
  logger.debug('Saving notification');
  const model = new googleSubscriptionNotificationModel(message);
  return model.save();
}

export const handleMessage = async (message: Message) => {
  try {
    const messageContent: googleNotification = JSON.parse(
      message.data.toString()
    ) as googleNotification;

    logger.debug(`Received message ${message.id}:`);
    logger.debug(JSON.stringify(messageContent));

    await saveNotification(messageContent);

    message.ack();
  } catch (err) {
    logger.error(err);
  }
};
