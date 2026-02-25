export const useBillMath = (bill: any) => {
  const vat = bill.total * 0.07;
  const beforeVat = bill.total - vat;
  const overdueDays = bill.overdueDays ?? 0;
  const isOverdue = overdueDays > 0;

  return { vat, beforeVat, overdueDays, isOverdue };
};