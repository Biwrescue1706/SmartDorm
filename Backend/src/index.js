import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./prisma.js";
import { scheduleOverdueAuto } from "./services/overdue.service.js";

if (process.env.NODE_ENV !== "production") dotenv.config();

const app = express();
app.set("trust proxy", true);

/* ================= GLOBAL ERROR ================= */

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err);
  process.exit(1);
});

/* ================= CORS ================= */

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
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("⚠️ Blocked CORS:", origin);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ================= ROUTES ================= */

import adminRouter from "./modules/admin.js";
import authRouter from "./modules/auth.js";
import billRouter from "./modules/Bill/bill.js";
import roomRouter from "./modules/room.js";
import bookingRouter from "./modules/ManageBooking/booking.js";
import checkoutRouter from "./modules/ManageBooking/checkout.js";
import paymentRouter from "./modules/Bill/payment.js";
import qrRouter from "./modules/qr.js";
import userRouter from "./modules/user.js";
import overview from "./modules/Bill/overview.js";
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

/* ================= ROOT ================= */

app.get("/", (_req, res) => {
  res.send("🚀 SmartDorm Backend Running");
});

/* ================= HEALTH ================= */

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    mode: process.env.NODE_ENV || "development",
  });
});

app.get("/health/db", async (_req, res) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), 3000)
  );

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeout
    ]);

    res.json({ db: "ok" });
  } catch (err) {
    res.status(500).json({ db: "fail", error: err.message });
  }
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log("====================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("====================================");

  console.log("✅ Prisma ready (lazy connect)");
  scheduleOverdueAuto();
});

/* ================= SHUTDOWN ================= */

async function shutdown() {
  console.log("🛑 Shutting down...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});