import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./prisma.js";
import { scheduleOverdueAuto } from "./services/overdue.service.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

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

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin);
    isAllowed ? callback(null, true) : callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors(corsOptions));
}

app.use(express.json());
app.use(cookieParser());

// routes
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
import dormProfileRoute from "./modules/dormProfile.js"

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

app.get("/", (_req, res) => res.send("🚀 SmartDorm Backend กำลังทำงาน"));
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use((err, _req, res, _next) => {
  console.error(" Global Error:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("🟡 กำลังเริ่มการเชื่อมต่อ Prisma...");
    await prisma.$connect();
    console.log("✅ เชื่อมต่อกับ MongoDB ผ่าน Prisma สำเร็จ");

    scheduleOverdueAuto();

    app.listen(PORT, () => {

      const env = process.env.NODE_ENV || "development";

      if (env === "production") {
        console.log("✅ โหมดการทำงาน : Production");
        console.log(`🚀 เซิร์ฟเวอร์กำลังทำงานอยู่ ${env}`);
        console.log(`🚀 เซิร์ฟเวอร์กำลังทำงานอยู่ที่ https://hub.smartdorm-biwboong.shop`);
      } else {
        console.log("✅ โหมดการทำงาน : Development");
        console.log(`🚀 เซิร์ฟเวอร์กำลังทำงานอยู่ ${env}`);
        console.log(`🚀 เซิร์ฟเวอร์กำลังทำงานอยู่ที่พอร์ต http://localhost:${PORT}`);
      }
    });
  } catch (err) {
    console.error("❌ เริ่มต้นล้มเหลว\n :", err);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});