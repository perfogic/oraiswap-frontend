import { MONTHS_ARR, TIMER } from '../constants';

export const formatCountdownTime = (milliseconds: number) => {
  const formatMilliseconds = milliseconds < 0 ? 0 : milliseconds;
  const seconds = Math.floor(formatMilliseconds / TIMER.MILLISECOND);
  const minutes = Math.floor(seconds / TIMER.SECOND);
  const hours = Math.floor(minutes / TIMER.MINUTE);
  const days = Math.floor(hours / TIMER.HOUR);

  const remainingHours = hours % TIMER.HOUR;
  const remainingMinutes = minutes % TIMER.MINUTE;
  const remainingSeconds = seconds % TIMER.SECOND;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(remainingHours).padStart(2, '0'),
    minutes: String(remainingMinutes).padStart(2, '0'),
    seconds: String(remainingSeconds).padStart(2, '0')
  };
};

export const calcDiffTime = (start: string | Date | number, end: string | Date | number) => {
  return new Date(end).getTime() - new Date(start).getTime();
};

export const calcPercent = (start: number, end: number, current: number) => {
  const total = new Date(end * TIMER.MILLISECOND).getTime() - new Date(start * TIMER.MILLISECOND).getTime();

  if (current <= 0) return 100;
  return total > 0 ? 100 - (current * 100) / total : 100;
};

export function dateFormat(date) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);

  const [month, day, year, time] = formattedDate.split(' ');

  return `${MONTHS_ARR[MONTHS_ARR.indexOf(month)]} ${day} ${year} ${time}`;
}

export function shortenAddress(address: string) {
  return address.substring(0, 8) + '...' + address.substring(address.length - 7, address.length);
}

export const formatUTCDateString = (date) => {
  // Get the current date and time
  const currentDate = new Date();

  // Format the date to a string
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'longOffset'
  }).format(currentDate);

  // Extract UTC offset
  const utcOffset = Intl.DateTimeFormat('en-US', { timeZoneName: 'longOffset' })
    .formatToParts(currentDate)
    .find((part) => part.type === 'timeZoneName').value;

  // Combine the formatted date and UTC offset
  const result = `${formattedDate}`;

  return result;
};
