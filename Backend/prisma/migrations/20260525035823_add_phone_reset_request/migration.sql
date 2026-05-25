-- CreateTable
CREATE TABLE "PasswordResetRequest" (
    "requestId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("requestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetRequest_username_key" ON "PasswordResetRequest"("username");
