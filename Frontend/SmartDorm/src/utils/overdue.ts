export const getOverdueDays = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.floor(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
};