// src/modules/Payments/paymentRouter.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { paymentService } from "./paymentService";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 💸 ผู้เช่าส่งสลิปการชำระเงิน
router.post("/create", upload.single("slip"), async (req: Request, res: Response) => {
  try {
    const result = await paymentService.createPayment({
      billId: req.body.billId,
      accessToken: req.body.accessToken,
      slip: req.file,
    });

    res.json({ message: "ส่งสลิปสำเร็จ", ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
