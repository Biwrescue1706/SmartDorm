import type { Bill, DormProfile } from "../types/All";

interface Props {
  bill: Bill;
  dormProfile: DormProfile;
  beforeVat: number;
  vat: number;
  thaiText: string;
}

export function InvoiceTable({ bill, beforeVat, vat, thaiText }: Props) {
  return (
    <table className="table table-sm table-striped align-middle text-center">
      <thead className="table-dark">
        <tr>
<th style={{ width: "5%" }}>อันดับ ( # )</th>
          <th style={{ width: "25%" }}>รายการ ( Description )</th>
          <th style={{ width: "10%" }}>เลขครั้งหลัง ( Last number )</th>
          <th style={{ width: "10%" }}>เลขครั้งก่อน ( Previous number )</th>
          <th style={{ width: "10%" }}>หน่วยที่ใช้ ( Units used )</th>
          <th style={{ width: "25%" }}>ราคา ( price )</th>
        </tr>
      </thead>

      <tbody>
  <tr>
    <td>1</td>
    <td>ค่าไฟ</td>
    <td>{bill.eAfter}</td>
    <td>{bill.eBefore}</td>
    <td>{bill.eUnits}</td>
    <td>{bill.electricCost.toLocaleString()}</td>
  </tr>

  <tr>
    <td>2</td>
    <td>ค่าน้ำ</td>
    <td>{bill.wAfter}</td>
    <td>{bill.wBefore}</td>
    <td>{bill.wUnits}</td>
    <td>{bill.waterCost.toLocaleString()}</td>
  </tr>

  <tr>
    <td>3</td>
    <td>ค่าส่วนกลาง</td>
    <td colSpan={3}>-</td>
    <td>{bill.service.toLocaleString()}</td>
  </tr>

  <tr>
    <td>4</td>
    <td>ค่าเช่า</td>
    <td colSpan={3}>-</td>
    <td>{bill.rent.toLocaleString()}</td>
  </tr>

  {(bill.overdueDays ?? 0) > 0 && (
    <tr>
      <td>5</td>
      <td>ค่าปรับ</td>
      <td colSpan={3}>ปรับ {bill.overdueDays} วัน</td>
      <td>{(bill.fine ?? 0).toLocaleString()}</td>
    </tr>
  )}
</tbody>

      <tfoot className="fw-semibold bg-light">
        <tr>
          <td colSpan={4}>ก่อน VAT</td>
          <td>{beforeVat.toLocaleString()}</td>
        </tr>
        <tr>
          <td colSpan={4}>VAT 7%</td>
          <td>{vat.toLocaleString()}</td>
        </tr>
        <tr className="table-success">
          <td colSpan={4}>รวม</td>
          <td>{bill.total.toLocaleString()}</td>
        </tr>
        <tr>
          <td colSpan={5}>( {thaiText} )</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ReceiptTable({
  bill,
  dormProfile,
  beforeVat,
  vat,
  thaiText,
}: Props) {
  return (
    <table className="table table-sm table-striped align-middle text-center">
      <thead className="table-dark">
        <tr>
<th>อันดับ ( # )</th>
          <th>รายการชำระเงิน</th>
          <th>จำนวน ( Quantity )</th>
          <th>หน่วยละ ( Price per unit )</th>
          <th>ราคา ( Price ) </th>
        </tr>
      </thead>

  <tbody>
  <tr>
    <td>1</td>
    <td>ค่าไฟ</td>
    <td>{bill.eUnits}</td>
    <td>{dormProfile.electricRate}</td>
    <td>{bill.electricCost.toLocaleString()}</td>
  </tr>

  <tr>
    <td>2</td>
    <td>ค่าน้ำ</td>
    <td>{bill.wUnits}</td>
    <td>{dormProfile.waterRate}</td>
    <td>{bill.waterCost.toLocaleString()}</td>
  </tr>

  <tr>
    <td>3</td>
    <td>ค่าเช่า</td>
    <td>1</td>
    <td>{bill.rent.toLocaleString()}</td>
    <td>{bill.rent.toLocaleString()}</td>
  </tr>

  <tr>
    <td>4</td>
    <td>ส่วนกลาง</td>
    <td>1</td>
    <td>{bill.service.toLocaleString()}</td>
    <td>{bill.service.toLocaleString()}</td>
  </tr>

  {(bill.overdueDays ?? 0) > 0 && (
    <tr>
      <td>5</td>
      <td>ค่าปรับ</td>
      <td>{bill.overdueDays}</td>
      <td>{dormProfile.overdueFinePerDay}</td>
      <td>{(bill.fine ?? 0).toLocaleString()}</td>
    </tr>
  )}
</tbody>

      <tfoot className="fw-semibold bg-light">
        <tr>
          <td colSpan={3}>ก่อน VAT</td>
          <td>{beforeVat.toLocaleString()}</td>
        </tr>
        <tr>
          <td colSpan={3}>VAT</td>
          <td>{vat.toLocaleString()}</td>
        </tr>
        <tr className="table-success">
          <td colSpan={3}>รวม</td>
          <td>{bill.total.toLocaleString()}</td>
        </tr>
        <tr>
          <td colSpan={4}>( {thaiText} )</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default function BillTables(props: Props) {
  const { bill } = props;

  return bill.billStatus === 0 ? (
    <InvoiceTable {...props} />
  ) : (
    <ReceiptTable {...props} />
  );
}