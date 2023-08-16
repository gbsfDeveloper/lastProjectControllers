import { decode } from 'jsonwebtoken';

import { config } from '../../config';
import {
  SubscriptionCadence,
  SubscriptionPlatforms,
  SubscriptionStatus,
} from '../../models';
import {
  DecodedPayload,
  DecodedRenewalInfoPayload,
  DecodedTransactionInfoPayload,
  testMaxProductId,
  testMaxProductIdEnum,
} from '../notifications/AppStoreNotifications';

const { prices } = config;

type GetDecodedPayload = (signedPayload: string) => DecodedPayload;

export const getDecodedPayload: GetDecodedPayload = (signedPayload) =>
  decode(signedPayload) as DecodedPayload;

type GetDecodedRenewalInfoPayload = (
  signedPayload?: string
) => DecodedRenewalInfoPayload | null;

export const getDecodedRenewalInfoPayload: GetDecodedRenewalInfoPayload = (
  signedPayload
) =>
  signedPayload === undefined
    ? null
    : (decode(signedPayload) as DecodedRenewalInfoPayload);

type GetDecodedTransactionInfoPayload = (
  signedPayload?: string
) => DecodedTransactionInfoPayload | null;

export const getDecodedTransactionInfoPayload: GetDecodedTransactionInfoPayload =
  (signedPayload) =>
    signedPayload === undefined
      ? null
      : (decode(signedPayload) as DecodedTransactionInfoPayload);

type GetActiveSubscriptionAppStoreProps = {
  productId?: testMaxProductId;
  transactionId?: string;
};

type GetActiveSubscriptionAppStore = (
  args: GetActiveSubscriptionAppStoreProps
) => {
  cadence: keyof typeof SubscriptionCadence;
  amount: string;
  transactionId: string;
  subscriptionStatus: SubscriptionStatus.PREMIUM;
  subscriptionPlatform: SubscriptionPlatforms.APP_STORE;
};

export const getActiveSubscriptionAppStore: GetActiveSubscriptionAppStore = ({
  productId,
  transactionId,
}) => {
  const cadence: keyof typeof SubscriptionCadence =
    productId === testMaxProductIdEnum['e1tech.testmax.monthly'] ||
    testMaxProductIdEnum['e1technology.testmax.monthly']
      ? SubscriptionCadence.MONTHLY
      : SubscriptionCadence.QUARTERLY;

  let amount = prices.MONTHLY;
  if (productId === testMaxProductIdEnum['e1tech.testmax.oneday']) {
    amount = prices.ONEDAY;
  } else if (productId === testMaxProductIdEnum['e1tech.testmax.quarterly']) {
    amount = prices.QUARTERLY;
  } else if (
    productId === testMaxProductIdEnum['e1technology.testmax.quarterly']
  ) {
    amount = prices.QUARTERLY;
  } else if (productId === testMaxProductIdEnum['e1tech.testmax.weekly']) {
    amount = prices.WEEKLY;
  }

  return {
    cadence,
    amount,
    transactionId: transactionId || '',
    subscriptionPlatform: SubscriptionPlatforms.APP_STORE,
    subscriptionStatus: SubscriptionStatus.PREMIUM,
  };
};
