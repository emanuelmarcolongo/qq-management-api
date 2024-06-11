/*
  Warnings:

  - A unique constraint covering the columns `[profile_id,transaction_id,function_id]` on the table `profile_function` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profile_id,transaction_id]` on the table `profile_transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profile_function_profile_id_transaction_id_function_id_key" ON "profile_function"("profile_id", "transaction_id", "function_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_transaction_profile_id_transaction_id_key" ON "profile_transaction"("profile_id", "transaction_id");
