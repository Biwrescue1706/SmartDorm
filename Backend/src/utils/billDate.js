import { thailandTime } from "./timezone.js";

const BILL_START_HOUR_UTC = 1;

export const normalizeBillMonthTH = (inputDate) => {
  const d = thailandTime(new Date(inputDate));

  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      1,
      BILL_START_HOUR_UTC,
      0,
      0
    )
  );
};

export const getDueDateNextMonth5th = (month) => {
  const d = new Date(month);

  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      5,
      1,
      0,
      0
    )
  );
};