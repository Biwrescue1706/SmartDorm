import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./prisma.js";
import { scheduleOverdueAuto } from "./services/overdue.service.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
app.set("trust proxy", 1);

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://manage.smartdorm-biwboong.shop",
  "https://bookingsroom.smartdorm-biwboong.shop",
  "https://details.smartdorm-biwboong.shop",
  "https://paymentbill.smartdorm-biwboong.shop",
  "https://returnroom.smartdorm-biwboong.shop",
  "https://hub.smartdorm-biwboong.shop",
];

app.use(
  cors(
    process.env.NODE_ENV !== "production"
      ? { origin: true, credentials: true }
      : {
          origin: allowedOrigins,
          credentials: true,
        }
  )
);

app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================
import adminRouter from "./modules/admin.js";
import authRouter from "./modules/auth.js";
import billRouter from "./modules/bill.js";
import roomRouter from "./modules/room.js";
import bookingRouter from "./modules/booking.js";
import checkoutRouter from "./modules/checkout.js";
import paymentRouter from "./modules/payment.js";
import qrRouter from "./modules/qr.js";
import userRouter from "./modules/user.js";
import overview from "./modules/overview.js";
import dormProfileRoute from "./modules/dormProfile.js";

app.use("/overview", overview);
app.use("/dorm-profile", dormProfileRoute);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/room", roomRouter);
app.use("/booking", bookingRouter);
app.use("/checkout", checkoutRouter);
app.use("/bill", billRouter);
app.use("/payment", paymentRouter);
app.use("/user", userRouter);
app.use("/qr", qrRouter);

// ================= HEALTH =================
app.get("/", (_req, res) =>
  res.send("🚀 SmartDorm Backend กำลังทำงาน")
);

app.get("/health", (_req, res) =>
  res.json({ status: "ok" })
);

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

/*
 ✅ เปิด PORT ก่อน
*/
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  /*
   ✅ ต่อ DB ทีหลัง
  */
  try {
    console.log("🟡 Connecting Prisma...");
    await prisma.$connect();
    console.log("✅ Prisma connected");

    scheduleOverdueAuto();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
});

// ================= SHUTDOWN =================
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});