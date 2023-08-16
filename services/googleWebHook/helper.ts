import { config } from '../../config';
import { SubscriptionCadence, SubscriptionStatus } from '../../models';

export const googleNotificationTypes: {
  notificationTypeId: number;
  description: string;
  equivalentStatus: `${SubscriptionStatus}`;
}[] = [
  {
    notificationTypeId: 1,
    description:
      'SUBSCRIPTION_RECOVERED - A subscription was recovered from account hold.',
    equivalentStatus: SubscriptionStatus.PREMIUM,
  },
  {
    notificationTypeId: 2,
    description: 'SUBSCRIPTION_RENEWED - An active subscription was renewed.',
    equivalentStatus: SubscriptionStatus.PREMIUM,
  },
  {
    notificationTypeId: 3,
    description:
      'SUBSCRIPTION_CANCELED - A subscription was either voluntarily or involuntarily cancelled. For voluntary cancellation, sent when the user cancels.',
    equivalentStatus: SubscriptionStatus.FREEMIUM,
  },
  {
    notificationTypeId: 4,
    description: 'SUBSCRIPTION_PURCHASED - A new subscription was purchased.',
    equivalentStatus: SubscriptionStatus.PREMIUM,
  },
  {
    notificationTypeId: 5,
    description:
      'SUBSCRIPTION_ON_HOLD - A subscription has entered account hold (if enabled).',
    equivalentStatus: SubscriptionStatus.FREEMIUM,
  },
  {
    notificationTypeId: 6,
    description:
      'SUBSCRIPTION_IN_GRACE_PERIOD - A subscription has entered grace period (if enabled).',
    equivalentStatus: SubscriptionStatus.TRIAL,
  },
  {
    notificationTypeId: 7,
    description:
      'SUBSCRIPTION_RESTARTED - User has restored their subscription from Play > Account > Subscriptions. The subscription was canceled but had not expired yet when the user restores. For more information, see [Restorations](/google/play/billing/subscriptions#restore).',
    equivalentStatus: SubscriptionStatus.PREMIUM,
  },
  {
    notificationTypeId: 8,
    description:
      'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED - A subscription price change has successfully been confirmed by the user.',
    equivalentStatus: SubscriptionStatus.PREMIUM,
  },
  {
    notificationTypeId: 9,
    description:
      "SUBSCRIPTION_DEFERRED - A subscription's recurrence time has been extended.",
    equivalentStatus: SubscriptionStatus.PREMIUM,
  },
  {
    notificationTypeId: 10,
    description: 'SUBSCRIPTION_PAUSED - A subscription has been paused.',
    equivalentStatus: SubscriptionStatus.FREEMIUM,
  },
  {
    notificationTypeId: 11,
    description:
      'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED - A subscription pause schedule has been changed.',
    equivalentStatus: SubscriptionStatus.FREEMIUM,
  },
  {
    notificationTypeId: 12,
    description:
      'SUBSCRIPTION_REVOKED - A subscription has been revoked from the user before the expiration time.',
    equivalentStatus: SubscriptionStatus.FREEMIUM,
  },
  {
    notificationTypeId: 13,
    description: 'SUBSCRIPTION_EXPIRED - A subscription has expired.',
    equivalentStatus: SubscriptionStatus.FREEMIUM,
  },
];

export const e1SubscriptionTypes = [
  {
    name: 'com.e1technology.testmax.1dayl_subs',
    equivalentDueDateTime: 1,
    price: config.prices.ONEDAY,
    cadence: SubscriptionCadence.ONEDAY,
  },
  {
    name: 'com.e1technology.testmax.week_subs',
    equivalentDueDateTime: 7,
    price: config.prices.WEEKLY,
    cadence: SubscriptionCadence.WEEKLY,
  },
  {
    name: 'com.e1technology.testmax.mensual_subs',
    equivalentDueDateTime: 1,
    price: config.prices.MONTHLY,
    cadence: SubscriptionCadence.MONTHLY,
  },
  {
    name: 'com.e1technology.testmax.3months_subs',
    equivalentDueDateTime: 3,
    price: config.prices.QUARTERLY,
    cadence: SubscriptionCadence.QUARTERLY,
  },
  {
    name: 'com.e1technology.testmax.6months_subs',
    equivalentDueDateTime: 6,
    price: config.prices.SEMIANNUAL,
    cadence: SubscriptionCadence.SEMIANNUAL,
  },
];
