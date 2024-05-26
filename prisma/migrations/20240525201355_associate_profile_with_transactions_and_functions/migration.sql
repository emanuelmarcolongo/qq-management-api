-- CreateTable
CREATE TABLE "profile_transaction" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_function" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "function_id" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_function_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "profile_transaction" ADD CONSTRAINT "profile_transaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_transaction" ADD CONSTRAINT "profile_transaction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_function" ADD CONSTRAINT "profile_function_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_function" ADD CONSTRAINT "profile_function_function_id_fkey" FOREIGN KEY ("function_id") REFERENCES "function"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_function" ADD CONSTRAINT "profile_function_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
