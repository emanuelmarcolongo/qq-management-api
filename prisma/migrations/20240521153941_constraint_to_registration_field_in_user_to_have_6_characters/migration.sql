/*
  Warnings:

  - You are about to alter the column `registration` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(6)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "registration" SET DATA TYPE VARCHAR(6);
