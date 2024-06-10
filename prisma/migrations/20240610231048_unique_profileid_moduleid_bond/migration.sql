/*
  Warnings:

  - A unique constraint covering the columns `[profile_id,module_id]` on the table `profile_module` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profile_module_profile_id_module_id_key" ON "profile_module"("profile_id", "module_id");
