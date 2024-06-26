/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `password_reset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `password_reset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "password_reset_email_key" ON "password_reset"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_key" ON "password_reset"("token");
