export const thailandTime = () =>
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    })
  );

export const toThaiString = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
  });
};