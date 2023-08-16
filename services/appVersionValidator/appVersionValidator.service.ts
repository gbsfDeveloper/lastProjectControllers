import { AppParamsModel } from '../../models';

export const functionGetValidVersion = async () => {
  return await AppParamsModel.findOne().select('validVersions').lean().exec();
};
