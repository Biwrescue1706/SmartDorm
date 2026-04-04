/*
  Warnings:

  - You are about to drop the column `bookingBookingId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `customerCustomerId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `roomRoomId` on the `Bill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_bookingBookingId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_customerCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_roomRoomId_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "bookingBookingId",
DROP COLUMN "customerCustomerId",
DROP COLUMN "roomRoomId";

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;
