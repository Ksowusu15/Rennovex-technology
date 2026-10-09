ALTER TABLE "Client"
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpires" TIMESTAMP(3);
