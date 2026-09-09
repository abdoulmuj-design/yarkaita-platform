-- AlterTable
ALTER TABLE "BespokeRequest" ADD COLUMN     "isNearCompany" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "materialDescription" TEXT;

-- AlterTable
ALTER TABLE "BridalRequest" ADD COLUMN     "isNearCompany" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "materialDescription" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAssignedUserId" UUID;
