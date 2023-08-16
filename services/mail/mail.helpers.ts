import path from 'path';

import { SubscriptionPlatforms, SubscriptionStatus } from '../../models';

export const RecurringCharge =
  'Cobro recurrente. Tu subscripción se renovará automáticamente y tu método de pago será cargado por el mismo periodo de tiempo y precio a menos de que canceles la suscripción cuando menos 24 horas antes de que termine esté periodo.';

export const resetPasswordTemplateImages = (pathImages: string) => [
  {
    filename: 'taco_mail.png',
    path: path.join(__dirname, `${pathImages}images/taco_mail.png`),
    cid: 'taco_mail',
  },
  {
    filename: 'testmax_logo_square_13.png',
    path: path.join(
      __dirname,
      `${pathImages}images/testmax_logo_square_13.png`
    ),
    cid: 'testmax_logo_square_13',
  },
  {
    filename: 'frame_13_jj7.png',
    path: path.join(__dirname, `${pathImages}images/frame_13_jj7.png`),
    cid: 'frame_13_jj7',
  },
  {
    filename: 'test_pandilla02_1.png',
    path: path.join(__dirname, `${pathImages}images/test_pandilla02_1.png`),
    cid: 'test_pandilla02_1',
  },
  {
    filename: 'instagram-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/instagram-circle-colored.png`
    ),
    cid: 'instagram-circle-colored',
  },
  {
    filename: 'facebook-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/facebook-circle-colored.png`
    ),
    cid: 'facebook-circle-colored',
  },
  {
    filename: 'tiktok-circle-colored.png',
    path: path.join(__dirname, `${pathImages}images/tiktok-circle-colored.png`),
    cid: 'tiktok-circle-colored',
  },
  {
    filename: 'youtube-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/youtube-circle-colored.png`
    ),
    cid: 'youtube-circle-colored',
  },
];

export const confirmEmailTemplateImages = (pathImages: string) => [
  {
    filename: 'facebook-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/facebook-circle-colored.png`
    ),
    cid: 'facebook-circle-colored',
  },
  {
    filename: 'frame_13_7hp.png',
    path: path.join(__dirname, `${pathImages}images/frame_13_7hp.png`),
    cid: 'frame_13_7hp',
  },
  {
    filename: 'instagram-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/instagram-circle-colored.png`
    ),
    cid: 'instagram-circle-colored',
  },
  {
    filename: 'test_pandilla02_1.png',
    path: path.join(__dirname, `${pathImages}images/test_pandilla02_1.png`),
    cid: 'test_pandilla02_1',
  },
  {
    filename: 'testmax_logo_square_13.png',
    path: path.join(
      __dirname,
      `${pathImages}images/testmax_logo_square_13.png`
    ),
    cid: 'testmax_logo_square_13',
  },
  {
    filename: 'tiktok-circle-colored.png',
    path: path.join(__dirname, `${pathImages}images/tiktok-circle-colored.png`),
    cid: 'tiktok-circle-colored',
  },
  {
    filename: 'youtube-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/youtube-circle-colored.png`
    ),
    cid: 'youtube-circle-colored',
  },
];

export const summaryCheckOutTemplateImages = (pathImages: string) => [
  {
    filename: 'appstorees.png',
    path: path.join(__dirname, `${pathImages}images/appstorees.png`),
    cid: 'appstorees',
  },
  {
    filename: 'facebook-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/facebook-circle-colored.png`
    ),
    cid: 'facebook-circle-colored',
  },
  {
    filename: 'frame_13.png',
    path: path.join(__dirname, `${pathImages}images/frame_13.png`),
    cid: 'frame_13',
  },
  {
    filename: 'googleplay_button_es.png',
    path: path.join(__dirname, `${pathImages}images/googleplay_button_es.png`),
    cid: 'googleplay_button_es',
  },
  {
    filename: 'group_2609212.png',
    path: path.join(__dirname, `${pathImages}images/group_2609212.png`),
    cid: 'group_2609212',
  },
  {
    filename: 'instagram-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/instagram-circle-colored.png`
    ),
    cid: 'instagram-circle-colored',
  },
  {
    filename: 'test_pandilla02_1.png',
    path: path.join(__dirname, `${pathImages}images/test_pandilla02_1.png`),
    cid: 'test_pandilla02_1',
  },
  {
    filename: 'test01_1.png',
    path: path.join(__dirname, `${pathImages}images/test01_1.png`),
    cid: 'test01_1',
  },
  {
    filename: 'testmax_logo_square_13.png',
    path: path.join(
      __dirname,
      `${pathImages}images/testmax_logo_square_13.png`
    ),
    cid: 'testmax_logo_square_13',
  },
  {
    filename: 'rectangle.png',
    path: path.join(__dirname, `${pathImages}images/rectangle.png`),
    cid: 'rectangle',
  },
  {
    filename: 'tiktok-circle-colored.png',
    path: path.join(__dirname, `${pathImages}images/tiktok-circle-colored.png`),
    cid: 'tiktok-circle-colored',
  },
  {
    filename: 'youtube-circle-colored.png',
    path: path.join(
      __dirname,
      `${pathImages}images/youtube-circle-colored.png`
    ),
    cid: 'youtube-circle-colored',
  },
];

export const paymentMediaText = (paymentMedia: string) => {
  switch (paymentMedia) {
    case SubscriptionPlatforms.TEST:
      return 'Test Pay';
    case SubscriptionPlatforms.STRIPE_OXXO:
      return 'Oxxo';
    case SubscriptionPlatforms.STRIPE_SUBSCRIPTION:
      return 'Tarjeta de crédito o débito';
    default:
      return '';
  }
};

export const subscriptionText = (subscription: SubscriptionStatus) => {
  switch (subscription) {
    case SubscriptionStatus.TRIAL:
      return 'Prueba Gratuita';
    case SubscriptionStatus.PREMIUM:
      return 'test Max sin límites';
    default:
      return '';
  }
};
