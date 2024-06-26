-- CreateTable
CREATE TABLE "password_reset" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);
