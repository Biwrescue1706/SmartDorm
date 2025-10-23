// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ SmartDorm-Admin Production Build Config
export default defineConfig({
  plugins: [react()],
  build: {
    // ✅ ถ้าไม่ได้ติดตั้ง terser ให้ใช้ "esbuild" แทน (ค่า default ของ Vite)
    // 👉 ถ้าคุณติดตั้ง terser แล้ว (npm install terser --save-dev)
    //    สามารถเปลี่ยนเป็น minify: "terser" ได้เลย
    minify: "terser",

    // 🚀 ปรับ limit ของคำเตือน bundle จาก 500kB → 1000kB
    chunkSizeWarningLimit: 1000,

    // 📦 แยก vendor library ออกเป็น chunk ย่อยเพื่อลดขนาด index.js
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },

    // ❌ ปิด sourcemap เพื่อลดขนาดไฟล์ production
    sourcemap: false,
  },

  // 🌐 base: ใช้กรณี deploy บน subpath เช่น /SmartDorm-Admin/
  // base: '/SmartDorm-Admin/',
});
