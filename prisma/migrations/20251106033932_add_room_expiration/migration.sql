-- AlterTable
ALTER TABLE "rooms" 
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lastBumpedAt" TIMESTAMP(3);
