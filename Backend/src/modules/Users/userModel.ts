// src/modules/Users/userModel.ts
export interface LineProfile {
  userId: string;
  displayName: string;
}

// ✅ สำหรับลงทะเบียนหรืออัปเดตข้อมูลลูกค้า (ใช้แค่ accessToken)
export interface RegisterInput {
  accessToken: string;
}