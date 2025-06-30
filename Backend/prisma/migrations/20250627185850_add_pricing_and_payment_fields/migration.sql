-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "blackWhitePrice" DOUBLE PRECISION,
ADD COLUMN     "colorPrice" DOUBLE PRECISION;
