import { DateTime } from 'luxon';

import { CalendarModel } from '../../models';

export const getCalendarWeek = async () => {
  const today = DateTime.now();
  const currentWeek = today.weekNumber;
  const currentYear = today.year;

  const calendar = await CalendarModel.findOne({
    'season.seasonWeek': currentWeek,
    'season.seasonYear': currentYear,
  })
    .select('season relatedSkillsId relatedSubSkillsId')
    .lean()
    .exec();

  return calendar?.season.find((season) => {
    return (
      season.seasonWeek === currentWeek && season.seasonYear === currentYear
    );
  });
};
