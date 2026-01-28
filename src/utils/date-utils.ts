import { intervalToDuration, formatDuration } from 'date-fns';

export const timeAgo = (date: string) => {
  const dur = intervalToDuration({ start: new Date(date), end: new Date() });

  const formatted = formatDuration(dur, {
    format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes'],
    delimiter: ', ',
  });

  return formatted ? `${formatted} ago` : 'just now';
};
