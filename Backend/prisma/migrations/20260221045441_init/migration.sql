-- CreateTable
CREATE TABLE "Admin" (
    "adminId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "Room" (
    "roomId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "rent" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "bookingFee" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("roomId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

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
    "total" INTEGER NOT NULL DEFAULT 0,
    "billStatus" INTEGER NOT NULL DEFAULT 0,
    "billDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "slipUrl" TEXT,
    "rent" INTEGER NOT NULL,
    "service" INTEGER NOT NULL DEFAULT 50,
    "wBefore" INTEGER NOT NULL,
    "wAfter" INTEGER NOT NULL,
    "wUnits" INTEGER NOT NULL,
    "waterCost" INTEGER NOT NULL DEFAULT 0,
    "eBefore" INTEGER NOT NULL,
    "eAfter" INTEGER NOT NULL,
    "eUnits" INTEGER NOT NULL,
    "electricCost" INTEGER NOT NULL DEFAULT 0,
    "fine" INTEGER NOT NULL DEFAULT 0,
    "overdueDays" INTEGER NOT NULL DEFAULT 0,
    "lastOverdueNotifyAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

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
    "service" INTEGER NOT NULL DEFAULT 50,
    "waterRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electricRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overdueFinePerDay" INTEGER NOT NULL DEFAULT 0,
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DormProfile_pkey" PRIMARY KEY ("dormId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Room_number_key" ON "Room"("number");

-- CreateIndex
CREATE INDEX "Booking_roomId_idx" ON "Booking"("roomId");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_approveStatus_idx" ON "Booking"("approveStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_bookingId_key" ON "Checkout"("bookingId");

-- CreateIndex
CREATE INDEX "Checkout_checkoutStatus_idx" ON "Checkout"("checkoutStatus");

-- CreateIndex
CREATE INDEX "Checkout_ReturnApprovalStatus_idx" ON "Checkout"("ReturnApprovalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_roomId_idx" ON "Bill"("roomId");

-- CreateIndex
CREATE INDEX "Bill_customerId_idx" ON "Bill"("customerId");

-- CreateIndex
CREATE INDEX "Bill_billStatus_idx" ON "Bill"("billStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_billId_key" ON "Payment"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "DormProfile_key_key" ON "DormProfile"("key");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "Admin"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("billId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;
