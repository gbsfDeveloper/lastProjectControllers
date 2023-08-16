import { Types } from 'mongoose';

import { PaymentPricesModel, PaywallCatalogModel } from '../../models';
import { StorePricesModel } from '../../models/storePrices.model';

export const getActivePrices = async () => {
  const daylyElement = {
    isActive: false,
    text: '1 Día',
    price: `$19.00`,
    tag: true,
    tagText: 'Control',
    miniText: '',
    productId: 'ONEDAY',
  };
  const weeklyElement = {
    isActive: true,
    text: '1 Semana',
    price: `$49.00`,
    tag: false,
    tagText: '',
    miniText: '/ $7.00 al día',
    productId: 'WEEKLY',
  };
  const monthlyElement = {
    isActive: true,
    text: '1 Mes',
    price: `$99.00`,
    tag: true,
    tagText: 'Popular',
    miniText: '/ $3.30 al día',
    productId: 'MONTHLY',
  };
  const TMonthlyElement = {
    isActive: true,
    text: '3 Meses',
    price: `$199.00`,
    tag: false,
    tagText: '',
    miniText: '/ $2.21 al día',
    productId: 'QUARTERLY',
  };
  const SMonthlyElement = {
    isActive: true,
    text: '6 Meses',
    price: `$299.00`,
    tag: true,
    tagText: 'Ahorro',
    miniText: '/ $1.66 al día',
    productId: 'SEMIANNUAL',
  };
  const AnnualElement = {
    isActive: false,
    text: '1 año',
    price: `$409.00`,
    tag: false,
    tagText: '',
    miniText: '/ $1.37 al día',
    productId: 'ANNUAL',
  };

  const prices = await PaymentPricesModel.find();

  if (prices.length === 0) {
    return [
      daylyElement,
      weeklyElement,
      monthlyElement,
      TMonthlyElement,
      SMonthlyElement,
      AnnualElement,
    ];
  }

  return prices;
};

export const getPaywallInfo = async (paywallName: string) => {
  return await PaywallCatalogModel.findOne({
    paywallName,
  }).select('-_id');
};

export const getPaywallInfoById = async (paywallId: Types.ObjectId) => {
  return await PaywallCatalogModel.findOne({
    _id: paywallId,
  }).select('-_id');
};

export const getProductTagBothStores = async (
  priceName: string | undefined
) => {
  if (!priceName) {
    return null;
  }

  const priceStoreInfo = await StorePricesModel.findOne({
    priceName,
  }).select('priceStoreTag');

  return priceStoreInfo ? priceStoreInfo.priceStoreTag : priceStoreInfo;
};
