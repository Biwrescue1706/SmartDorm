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
      toast(
        "error",
        "เชื่อมต่อไม่สำเร็จ",
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์"
      );
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
      toast("success", "อัปเดตสำเร็จ", "ระบบได้บันทึกข้อมูลบิลแล้ว");
      await fetchBills();
    } catch {
      Swal.close();
      toast("error", "อัปเดตไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ---------------- ลบบิล ----------------
  const deleteBill = async (billId: string, roomNumber: string) => {
    const ok = await Swal.fire({
      title: `ลบบิลห้อง ${roomNumber}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}${DeleteBill(billId)}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId }),
      });

      if (!res.ok) throw new Error();

      toast("success", "ลบบิลสำเร็จ", `บิลห้อง ${roomNumber} ถูกลบแล้ว`);
      await fetchBills();
    } catch {
      toast("error", "ลบไม่สำเร็จ", "ไม่สามารถลบบิลได้");
    }
  };

  // ---------------- อนุมัติบิล ----------------
  const approveBill = async (billId: string, room: string) => {
    const ok = await Swal.fire({
      title: `อนุมัติบิลห้อง ${room}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✔️ อนุมัติ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/bill/approve/${billId}`,
        {},
        { withCredentials: true }
      );

      toast("success", "อนุมัติการชำระแล้ว", `บิลห้อง ${room} ถูกอนุมัติ`);
      await fetchBills();
    } catch {
      toast("error", "อนุมัติไม่สำเร็จ", "ไม่สามารถอัปเดตสถานะได้");
    }
  };

  // ---------------- ปฏิเสธบิล ----------------
  const rejectBill = async (billId: string, room: string) => {
    const ok = await Swal.fire({
      title: `ปฏิเสธบิลห้อง ${room}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "❌ ปฏิเสธ",
      cancelButtonText: "ยกเลิก",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API_BASE}/bill/reject/${billId}`,
        {},
        { withCredentials: true }
      );

      toast("info", "ปฏิเสธสำเร็จ", "สถานะกลับเป็นยังไม่ชำระ");
      await fetchBills();
    } catch {
      toast("error", "ปฏิเสธไม่สำเร็จ", "ระบบไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  // ---------------- แจ้งเตือนบิลค้างชำระ ----------------
  const overdueBill = async (billId: string, room: string) => {
    const bill = bills.find((b) => b.billId === billId);

    if (!bill || bill.billStatus !== 0) {
      toast(
        "info",
        "ไม่สามารถแจ้งเตือน",
        "บิลนี้ไม่อยู่ในสถานะค้างชำระ"
      );
      return;
    }

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
      Swal.fire({
        title: "กำลังส่งแจ้งเตือน...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await axios.put(
        `${API_BASE}/bill/overdue/${billId}`,
        {},
        { withCredentials: true }
      );

      Swal.close();
      toast("success", "แจ้งเตือนสำเร็จ", `ส่งแจ้งเตือนห้อง ${room}`);
      await fetchBills();
    } catch (err: any) {
      Swal.close();
      toast(
        "error",
        "แจ้งเตือนไม่สำเร็จ",
        err?.response?.data?.error || "เกิดข้อผิดพลาด"
      );
    }
  };

  // ---------------- init ----------------
  useEffect(() => {
    fetchBills();
  }, []);

  return {
    bills,
    loading,
    fetchBills,
    updateBill,
    deleteBill,
    approveBill,
    rejectBill,
    overdueBill,
  };
}