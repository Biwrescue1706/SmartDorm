-- CreateTable
CREATE TABLE "Admin" (
    "adminId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "Room" (
    "roomId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "bookingFee" DOUBLE PRECISION NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("roomId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "ctitle" TEXT,
    "cname" TEXT,
    "csurname" TEXT,
    "fullName" TEXT,
    "cphone" TEXT,
    "cmumId" TEXT,
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkin" TIMESTAMP(3) NOT NULL,
    "checkinAt" TIMESTAMP(3),
    "checkinStatus" INTEGER NOT NULL DEFAULT 0,
    "approveStatus" INTEGER NOT NULL DEFAULT 0,
    "approvedAt" TIMESTAMP(3),
    "slipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "Checkout" (
    "checkoutId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "checkout" TIMESTAMP(3) NOT NULL,
    "ReturnApprovalStatus" INTEGER NOT NULL DEFAULT 0,
    "RefundApprovalDate" TIMESTAMP(3),
    "checkoutStatus" INTEGER NOT NULL DEFAULT 0,
    "checkoutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("checkoutId")
);

-- CreateTable
CREATE TABLE "Bill" (
    "billId" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "roomId" TEXT,
    "customerId" TEXT,
    "bookingId" TEXT,
    "month" TIMESTAMP(3) NOT NULL,
    "ctitle" TEXT,
    "cname" TEXT,
    "csurname" TEXT,
    "fullName" TEXT,
    "cphone" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    "billStatus" INTEGER NOT NULL DEFAULT 0,
    "billDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "slipUrl" TEXT,
    "rent" DOUBLE PRECISION NOT NULL,
    "service" DOUBLE PRECISION NOT NULL,
    "wBefore" DOUBLE PRECISION NOT NULL,
    "wAfter" DOUBLE PRECISION NOT NULL,
    "wUnits" DOUBLE PRECISION NOT NULL,
    "waterCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eBefore" DOUBLE PRECISION NOT NULL,
    "eAfter" DOUBLE PRECISION NOT NULL,
    "eUnits" DOUBLE PRECISION NOT NULL,
    "electricCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overdueDays" INTEGER DEFAULT 0,
    "fine" DOUBLE PRECISION DEFAULT 0,
    "lastOverdueNotifyAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "roomRoomId" TEXT,
    "bookingBookingId" TEXT,
    "customerCustomerId" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("billId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "slipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "DormProfile" (
    "dormId" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'MAIN',
    "dormName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "taxType" INTEGER NOT NULL DEFAULT 0,
    "receiverTitle" TEXT,
    "receiverName" TEXT,
    "receiverSurname" TEXT,
    "receiverFullName" TEXT,
    "service" DOUBLE PRECISION NOT NULL,
    "waterRate" DOUBLE PRECISION NOT NULL,
    "electricRate" DOUBLE PRECISION NOT NULL,
    "overdueFinePerDay" DOUBLE PRECISION NOT NULL,
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DormProfile_pkey" PRIMARY KEY ("dormId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Room_number_key" ON "Room"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Booking_roomId_idx" ON "Booking"("roomId");

-- CreateIndex
CREATE INDEX "Booking_roomId_checkinStatus_createdAt_idx" ON "Booking"("roomId", "checkinStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_approveStatus_idx" ON "Booking"("approveStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_bookingId_key" ON "Checkout"("bookingId");

-- CreateIndex
CREATE INDEX "Checkout_bookingId_idx" ON "Checkout"("bookingId");

-- CreateIndex
CREATE INDEX "Checkout_checkoutStatus_idx" ON "Checkout"("checkoutStatus");

-- CreateIndex
CREATE INDEX "Checkout_ReturnApprovalStatus_idx" ON "Checkout"("ReturnApprovalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_createdAt_idx" ON "Bill"("createdAt");

-- CreateIndex
CREATE INDEX "Bill_billStatus_idx" ON "Bill"("billStatus");

-- CreateIndex
CREATE INDEX "Bill_roomId_month_idx" ON "Bill"("roomId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_billId_key" ON "Payment"("billId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "DormProfile_key_key" ON "DormProfile"("key");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_roomRoomId_fkey" FOREIGN KEY ("roomRoomId") REFERENCES "Room"("roomId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_bookingBookingId_fkey" FOREIGN KEY ("bookingBookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_customerCustomerId_fkey" FOREIGN KEY ("customerCustomerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("billId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;
