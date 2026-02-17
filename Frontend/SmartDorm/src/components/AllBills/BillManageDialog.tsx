import * as Dialog from "@radix-ui/react-dialog";
import type { Bill } from "../../types/All";

interface Props {
  bill: Bill;
  onApprove: (billId: string, room: string) => void;
  onReject: (billId: string, room: string) => void;
  onClose: () => void;
}

export default function BillManageDialog({
  bill,
  onApprove,
  onReject,
  onClose,
}: Props) {
  const roomNumber = bill.room?.number ?? "-";

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />

        <Dialog.Content
          className="position-fixed start-50 top-50 translate-middle bg-white shadow-lg rounded-4 p-4"
          style={{ width: "92%", maxWidth: "420px", zIndex: 11000 }}
        >
          <Dialog.Title className="fw-bold text-center mb-3">
            จัดการบิลห้อง {roomNumber}
          </Dialog.Title>

          <p className="text-center text-muted mb-4">
            เลือกการดำเนินการสำหรับบิลนี้
          </p>

          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn btn-success fw-bold px-4"
              onClick={() => onApprove(bill.billId, roomNumber)}
            >
              ✔️ อนุมัติ
            </button>

            <button
              className="btn btn-danger fw-bold px-4"
              onClick={() => onReject(bill.billId, roomNumber)}
            >
              ❌ ปฏิเสธ
            </button>
          </div>

          <div className="text-center mt-4">
            <button className="btn btn-secondary" onClick={onClose}>
              ปิด
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}