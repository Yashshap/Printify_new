-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "addressProofUrl" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankProofUrl" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "ifsc" TEXT,
ADD COLUMN     "kycAddress" TEXT,
ADD COLUMN     "kycFailureReason" TEXT,
ADD COLUMN     "kyc_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "panDocumentUrl" TEXT,
ADD COLUMN     "razorpayAccountId" TEXT;
