/*
  Warnings:

  - The primary key for the `PasswordResetRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "PasswordResetRequest" DROP CONSTRAINT "PasswordResetRequest_pkey",
ALTER COLUMN "requestId" DROP DEFAULT,
ALTER COLUMN "requestId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("requestId");
DROP SEQUENCE "PasswordResetRequest_requestId_seq";
