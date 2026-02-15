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
          <th style={{ width: "35%" }}>รายการ</th>
          <th style={{ width: "15%" }}>เลขมิเตอร์หลัง</th>
          <th style={{ width: "15%" }}>เลขมิเตอร์ก่อน</th>
          <th style={{ width: "15%" }}>หน่วยที่ใช้</th>
          <th style={{ width: "20%" }}>เงิน</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>ค่าไฟ</td>
          <td>{bill.eAfter}</td>
          <td>{bill.eBefore}</td>
          <td>{bill.eUnits}</td>
          <td>{bill.electricCost.toLocaleString()}</td>
        </tr>

        <tr>
          <td>ค่าน้ำ</td>
          <td>{bill.wAfter}</td>
          <td>{bill.wBefore}</td>
          <td>{bill.wUnits}</td>
          <td>{bill.waterCost.toLocaleString()}</td>
        </tr>

        <tr>
          <td>ค่าส่วนกลาง</td>
          <td colSpan={3}>-</td>
          <td>{bill.service.toLocaleString()}</td>
        </tr>

        <tr>
          <td>ค่าเช่า</td>
          <td colSpan={3}>-</td>
          <td>{bill.rent.toLocaleString()}</td>
        </tr>

        {(bill.overdueDays ?? 0) > 0 && (
          <tr>
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
          <th>รายการ</th>
          <th>จำนวน</th>
          <th>หน่วยละ</th>
          <th>ราคา</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>ค่าไฟ</td>
          <td>{bill.eUnits}</td>
          <td>{dormProfile.electricRate}</td>
          <td>{bill.electricCost.toLocaleString()}</td>
        </tr>

        <tr>
          <td>ค่าน้ำ</td>
          <td>{bill.wUnits}</td>
          <td>{dormProfile.waterRate}</td>
          <td>{bill.waterCost.toLocaleString()}</td>
        </tr>

        <tr>
          <td>ค่าเช่า</td>
          <td>1</td>
          <td>{bill.rent.toLocaleString()}</td>
          <td>{bill.rent.toLocaleString()}</td>
        </tr>

        <tr>
          <td>ส่วนกลาง</td>
          <td>1</td>
          <td>{bill.service.toLocaleString()}</td>
          <td>{bill.service.toLocaleString()}</td>
        </tr>

        {(bill.overdueDays ?? 0) > 0 && (
          <tr>
            <td>ค่าปรับ</td>
            <td>{bill.overdueDays}</td>
            <td>{dormProfile.overdueFinePerDay}</td>
            <td>{(bill.fine ?? 0).toLocaleString()}</td>
          </tr>
        )}
      </tbody>

      <tfoot className="fw-semibold bg-light">
        <tr>
          <td colSpan={2}>ก่อน VAT</td>
          <td>{beforeVat.toLocaleString()}</td>
        </tr>
        <tr>
          <td colSpan={2}>VAT</td>
          <td>{vat.toLocaleString()}</td>
        </tr>
        <tr className="table-success">
          <td colSpan={2}>รวม</td>
          <td>{bill.total.toLocaleString()}</td>
        </tr>
        <tr>
          <td colSpan={3}>( {thaiText} )</td>
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