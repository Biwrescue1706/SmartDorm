import { userRepository } from "./userRepository";
import { RegisterInput } from "./userModel";
import { verifyLineToken } from "../../utils/verifyLineToken";

export const userService = {
  // 🧩 สมัครหรืออัปเดตข้อมูลลูกค้า
  async register(input: RegisterInput) {
    const { accessToken, ctitle, cname, csurname, cphone, cmumId } = input;
    const { userId, displayName } = await verifyLineToken(accessToken);
    const fullName = `${ctitle}${cname} ${csurname ?? ""}`.trim();

    let customer = await userRepository.findCustomerByUserId(userId);

    if (customer) {
      customer = await userRepository.updateCustomer(customer.customerId, {
        userName: displayName,
        ctitle,
        cname,
        csurname,
        cphone,
        cmumId,
        fullName,
      });
    } else {
      customer = await userRepository.createCustomer({
        userId,
        userName: displayName,
        ctitle,
        cname,
        csurname,
        cphone,
        cmumId,
        fullName,
      });
    }

    return customer;
  },

  // 📋 ดึงลูกค้าทั้งหมด (Admin)
  async getAllUsers() {
    const users = await userRepository.findAllCustomers();
    if (!users.length) throw new Error("ไม่พบข้อมูลลูกค้าในระบบ");
    return users;
  },

  // 👤 ดึงโปรไฟล์ลูกค้า
  async getProfile(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await userRepository.getCustomerWithRelations(userId);
    if (!customer) throw new Error("ไม่พบข้อมูลลูกค้า");
    return customer;
  },

  // 💰 ดึงบิลที่ชำระแล้ว
  async getPaidBills(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await userRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบลูกค้า");

    const bills = await userRepository.findPaidBills(customer.customerId);
    return bills.map((b) => ({
      billCode: b.billId.slice(-6).toUpperCase(),
      roomNumber: b.room.number,
      total: b.total,
      slipUrl: b.payment?.slipUrl,
      paidAt: b.payment?.createdAt,
    }));
  },

  // 💸 ดึงบิลที่ยังไม่ชำระ
  async getUnpaidBills(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await userRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบลูกค้า");
    return userRepository.findUnpaidBills(customer.customerId);
  },

  // 🚪 ดึงการจองที่สามารถคืนห้องได้
  async getReturnableBookings(accessToken: string) {
    const { userId } = await verifyLineToken(accessToken);
    const customer = await userRepository.findCustomerByUserId(userId);
    if (!customer) throw new Error("ไม่พบลูกค้า");
    return userRepository.findReturnableBookings(customer.customerId);
  },

  // 🔍 ค้นหาลูกค้าตามชื่อ / เบอร์โทร / ห้อง
  async searchUsers(keyword: string) {
    return userRepository.searchCustomers(keyword);
  },

  async deleteUser(customerId: string) {
    const deleted = await userRepository.deleteCustomer(customerId);
    return deleted;
  },
  
};
