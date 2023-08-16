import { PubSub } from '@google-cloud/pubsub';

import { config } from '../../config';
import { logger } from '../../lib/logger';
import { handleMessage } from './messageHandler';

const pubSubClient = new PubSub();

function listenForMessages() {
  logger.info('Initializing GCP Pub/Sub service');
  const subscription = pubSubClient.subscription(
    config.playStore.SUBSCRIPTIONNAMEORID
  );
  subscription.on('message', handleMessage);
  subscription.on('error', (error) => logger.error(error));
}

export function initPubSubService() {
  try {
    listenForMessages();
  } catch (error) {
    logger.error(error);
  }
}
