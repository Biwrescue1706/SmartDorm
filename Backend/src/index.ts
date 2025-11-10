// src/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./prisma";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// ---------------- Allowed Origins ----------------
const allowedOrigins = [
  // localhost (dev)
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  // Render deploys
  "https://smartdorm-returnroom.onrender.com",

  // Custom domains
  "https://smartdorm-admin.biwbong.shop",
  "https://smartdorm-bookingsroom.biwbong.shop",
  "https://smartdorm-detail.biwbong.shop",
  "https://smartdorm-paymentbill.biwbong.shop",
];
//  CORS Config
const corsOptions: cors.CorsOptions = {
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

// ใช้ CORS (production / dev mode)
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors(corsOptions));
}

app.use(express.json());
app.use(cookieParser());

// ---------------- Routes ----------------
import adminRouter from "./modules/admin";
import authRouter from "./modules/auth";
import billRouter from "./modules/bill";
import roomRouter from "./modules/room";
import bookingRouter from "./modules/booking";
import checkoutRouter from "./modules/checkout";
import paymentRouter from "./modules/payment";
import qrRouter from "./modules/qr";
import userRouter from "./modules/user";

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/room", roomRouter);
app.use("/booking", bookingRouter);
app.use("/checkout", checkoutRouter);
app.use("/bill", billRouter);
app.use("/payment", paymentRouter);
app.use("/user", userRouter);
app.use("/qr", qrRouter);

// ---------------- Health Check ----------------
app.get("/", (_req, res) => res.send("🚀 SmartDorm Backend is running"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ---------------- Error Handler ----------------
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(" Global Error:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 3000; // ✅ Default local dev 3000

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to MongoDB via Prisma");
  } catch (err) {
    console.error("❌ Prisma connection error:", err);
    process.exit(1);
  }

  const env = process.env.NODE_ENV || "development";
  if (env !== "production") {
    console.log(`🚀 Server running locally at http://localhost:${PORT}`);
  } else {
    console.log(`🚀 Server running `);
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected (SIGINT)");
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected (SIGTERM)");
  process.exit(0);
});
