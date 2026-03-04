import express from "express"; // express
import dotenv from "dotenv"; // env
import cors from "cors"; // cors
import cookieParser from "cookie-parser"; // cookie
import prisma from "./prisma.js"; // prisma
import { scheduleOverdueAuto } from "./services/overdue.service.js"; // cron

// โหลด env ตอน local
if (process.env.NODE_ENV !== "production") dotenv.config();

const app = express();
app.set("trust proxy", true);

// cors allow
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

// cors config
app.use(
  cors(
    process.env.NODE_ENV !== "production"
      ? { origin: true, credentials: true }
      : { origin: allowedOrigins, credentials: true }
  )
);

app.use(express.json());
app.use(cookieParser());

/* ================= ROUTES ================= */

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

/* ================= THAI TIME ================= */

function thaiNow() {
  const now = new Date();

  return {
    date: now.toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time:
      now.toLocaleTimeString("th-TH", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
      }) + " น.",
  };
}

/* ================= ROOT ================= */

app.get("/", async (_req, res) => {
  const mode = process.env.NODE_ENV || "development";
  const port = process.env.PORT || 3000;
  const { date, time } = thaiNow();

  let db = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  res.send(`
    🚀 SmartDorm Backend Running <br/>
    ✅ Mode: ${mode} <br/>
    🌐 Port: ${port} <br/>
    🗄 Database: ${db} <br/>
    🕒 เวลา: ${time} <br/>
    📅 วัน${date}
  `);
});

/* ================= HEALTH ================= */

app.get("/health", async (_req, res) => {
  const { date, time } = thaiNow();

  let db = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  res.json({
    status: "ok",
    mode: process.env.NODE_ENV || "development",
    database: db,
    time,
    date,
  });
});

/* ================= START SERVER ================= */

const PORT = Number(process.env.PORT) || 3000;
const ENV = process.env.NODE_ENV || "development";

// ⭐ Render ต้องเห็น listen ตรงนี้ทันที
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");

  if (ENV === "production") {
    console.log("✅ Mode: Production");
    console.log(`🚀 Server running on port ${PORT}`);
  } else {
    console.log("✅ Mode: Development");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  }

  console.log("====================================");
});

/* ================= DB INIT ================= */

(async () => {
  try {
    console.log("🟡 Connecting Prisma...");
    await prisma.$connect();
    console.log("✅ Prisma connected");

    scheduleOverdueAuto();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

/* ================= SHUTDOWN ================= */

async function shutdown() {
  console.log("🛑 Shutting down...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);