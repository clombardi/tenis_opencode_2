export function normalizeToMidnightGMT(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function isMidnightGMT(date: Date): boolean {
  return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
}

export function parseAndNormalizeDate(dateString: string): Date {
  const date = new Date(dateString);
  return normalizeToMidnightGMT(date);
}
