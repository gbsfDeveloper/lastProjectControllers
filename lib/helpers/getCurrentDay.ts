import { Streak } from '../../models';
import { UTCDate } from './generateDates';

const weekDays: Record<number, keyof Streak> = [];

weekDays[1] = 'mon';
weekDays[2] = 'tue';
weekDays[3] = 'wed';
weekDays[4] = 'thu';
weekDays[5] = 'fri';

export const getCurrentDay = () => {
  const utcTime = UTCDate().getTime();
  const hours = 6;
  const hourToMiliseconds = hours * 60 * 60000;
  const today: number = new Date(utcTime - hourToMiliseconds).getDay();
  return weekDays[today];
};
