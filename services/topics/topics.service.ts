import { SkillModel } from '../../models';

export const getSkills = async () => {
  return SkillModel.find().sort({ skillNumber: 1 }).lean().exec();
};
