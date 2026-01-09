import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE } from "../../config";
import {
  GetAllBill,
  UpdateBill,
  DeleteBill,
} from "../../apis/endpoint.api";
import type { Bill } from "../../types/Bill";
import { toast } from "../../utils/toast";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- ดึงข้อมูลบิลทั้งหมด ----------------
  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${GetAllBill}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        toast("error", "โหลดข้อมูลบิลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลได้");
        return;
      }

      const data = await res.json();
      setBills(data);
    } catch {
      toast("error", "เชื่อมต่อไม่สำเร็จ", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- อัปเดตบิล ----------------
  const updateBill = async (billId: string, formValues: any) => {
    try {
      Swal.fire({
        title: "กำลังอัปเดต...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(`${API_BASE}${UpdateBill(billId)}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error();

      Swal.close();
      toast("success", "อัปเดตสำเร็จ", "บันทึกข้อมูลเรียบร้อย");
      await fetchBills();
    } catch {
      Swal.close();
      toast("error", "อัปเดตไม่สำเร็จ", "กรุณาลองใหม่");
    }
  };

  // ================== ของเดิม (รับ Bill) ==================

  const deleteBill = async (bill: Bill) => {
    const room = bill.room.number;

    const ok = await Swal.fire({
      title: `ลบบิลห้อง ${room}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteBill(bill.billId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      toast("success", "ลบบิลสำเร็จ", `บิลห้อง ${room} ถูกลบแล้ว`);
      await fetchBills();
    } catch {
      toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบบิลได้");
    }
  };

  const approveBill = async (bill: Bill) => {
    const room = bill.room.number;

    const ok = await Swal.fire({
      title: `อนุมัติบิลห้อง ${room}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/bill/approve/${bill.billId}`,
        {},
        { withCredentials: true }
      );

      toast("success", "อนุมัติแล้ว", `บิลห้อง ${room}`);
      await fetchBills();
    } catch {
      toast("error", "อนุมัติไม่สำเร็จ", "ไม่สามารถอัปเดตสถานะ");
    }
  };

  const rejectBill = async (bill: Bill) => {
    const room = bill.room.number;

    const ok = await Swal.fire({
      title: `ปฏิเสธบิลห้อง ${room}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/bill/reject/${bill.billId}`,
        {},
        { withCredentials: true }
      );

      toast("info", "ปฏิเสธแล้ว", "สถานะกลับเป็นยังไม่จ่าย");
      await fetchBills();
    } catch {
      toast("error", "ปฏิเสธไม่สำเร็จ", "ระบบผิดพลาด");
    }
  };

  const overdueBill = async (bill: Bill) => {
    if (bill.billStatus !== 0) {
      toast("info", "แจ้งเตือนไม่ได้", "บิลไม่ค้างชำระ");
      return;
    }

    const room = bill.room.number;

    const ok = await Swal.fire({
      title: `แจ้งเตือนบิลห้อง ${room}?`,
      text: "ระบบจะส่ง LINE แจ้งลูกค้า",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "แจ้งเตือน",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      Swal.showLoading();

      await axios.put(
        `${API_BASE}/bill/overdue/${bill.billId}`,
        {},
        { withCredentials: true }
      );

      Swal.close();
      toast("success", "แจ้งเตือนสำเร็จ", `ห้อง ${room}`);
      await fetchBills();
    } catch {
      Swal.close();
      toast("error", "แจ้งเตือนไม่สำเร็จ", "เกิดข้อผิดพลาด");
    }
  };

  // ================== เพิ่มใหม่ (รับ billId) ==================

  const findBill = (billId: string) =>
    bills.find((b) => b.billId === billId);

  const deleteBillById = async (billId: string) => {
    const bill = findBill(billId);
    if (!bill) return;
    await deleteBill(bill);
  };

  const approveBillById = async (billId: string) => {
    const bill = findBill(billId);
    if (!bill) return;
    await approveBill(bill);
  };

  const rejectBillById = async (billId: string) => {
    const bill = findBill(billId);
    if (!bill) return;
    await rejectBill(bill);
  };

  const overdueBillById = async (billId: string) => {
    const bill = findBill(billId);
    if (!bill) return;
    await overdueBill(bill);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return {
    bills,
    loading,
    fetchBills,
    updateBill,

    // ของเดิม
    deleteBill,
    approveBill,
    rejectBill,
    overdueBill,

    // ของใหม่ (ใช้กับ component ที่ส่งมาเป็น billId)
    deleteBillById,
    approveBillById,
    rejectBillById,
    overdueBillById,
  };
}