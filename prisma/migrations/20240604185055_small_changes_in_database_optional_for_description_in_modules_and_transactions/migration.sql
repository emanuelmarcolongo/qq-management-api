/*
  Warnings:

  - You are about to drop the column `profileId` on the `profile_function` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `profile_module` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `profile_transaction` table. All the data in the column will be lost.
  - Added the required column `profile_id` to the `profile_function` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `profile_module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_id` to the `profile_transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "profile_function" DROP CONSTRAINT "profile_function_profileId_fkey";

-- DropForeignKey
ALTER TABLE "profile_module" DROP CONSTRAINT "profile_module_profileId_fkey";

-- DropForeignKey
ALTER TABLE "profile_transaction" DROP CONSTRAINT "profile_transaction_profileId_fkey";

-- AlterTable
ALTER TABLE "function" ALTER COLUMN "description" SET DEFAULT 'Sem descrição';

-- AlterTable
ALTER TABLE "module" ALTER COLUMN "description" SET DEFAULT 'Sem descrição';

-- AlterTable
ALTER TABLE "profile_function" DROP COLUMN "profileId",
ADD COLUMN     "profile_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "profile_module" DROP COLUMN "profileId",
ADD COLUMN     "profile_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "profile_transaction" DROP COLUMN "profileId",
ADD COLUMN     "profile_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DEFAULT 'Sem descrição';

-- AddForeignKey
ALTER TABLE "profile_module" ADD CONSTRAINT "profile_module_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_transaction" ADD CONSTRAINT "profile_transaction_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_function" ADD CONSTRAINT "profile_function_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
