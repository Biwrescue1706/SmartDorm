export const thaiNow = () => {
  const now = new Date();

  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  return new Date(utc + 7 * 60 * 60 * 1000); // UTC+7
};