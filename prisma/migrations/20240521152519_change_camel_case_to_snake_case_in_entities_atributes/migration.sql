/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `module` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `module` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "module" DROP COLUMN "backgroundColor",
DROP COLUMN "textColor",
ADD COLUMN     "background_color" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "text_color" TEXT NOT NULL DEFAULT '#000000';

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "isAdmin",
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;
