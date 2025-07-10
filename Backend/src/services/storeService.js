import { PrismaClient } from '@prisma/client';
import { withPrefix } from '../utils/idPrefix.js';
import { createRazorpaySubAccount } from './razorpayService.js';

const prisma = new PrismaClient();

export const registerStore = async (storeData, ownerId) => {
  // Only allow one store per user for now
  const existing = await prisma.store.findFirst({ where: { ownerId, isDeleted: false } });
  if (existing) throw new Error('User already has a registered store');
  const {
    storeName,
    storeProfileImage,
    businessName,
    gstNumber,
    shopAddress,
    supportPhone,
    bankAccount,
    billingAddress,
    // KYC fields
    ownerName,
    pan,
    bankAccountNumber,
    ifsc,
    businessType,
    contactEmail,
    contactPhone,
    kycAddress
  } = storeData;
  // 1. Create the store in the DB (status: pending_approval, kyc_status: pending)
  let store = await prisma.store.create({
    data: {
      id: withPrefix('SHP'),
      storeName,
      storeProfileImage,
      businessName,
      gstNumber,
      shopAddress,
      supportPhone,
      bankAccount,
      billingAddress,
      ownerId,
      status: 'pending_approval',
      ownerName,
      pan,
      bankAccountNumber,
      ifsc,
      businessType,
      contactEmail,
      contactPhone,
      kycAddress,
      kyc_status: 'pending',
    },
  });
  // 2. Call Razorpay Route API to create sub-account
  try {
    const razorpayResp = await createRazorpaySubAccount({
      ownerName,
      businessName,
      gstNumber,
      shopAddress,
      supportPhone,
      bankAccountNumber,
      ifsc,
      businessType,
      contactEmail,
      contactPhone,
      kycAddress,
      pan
    });
    // 3. Update store with Razorpay account ID and KYC status
    store = await prisma.store.update({
      where: { id: store.id },
      data: {
        razorpayAccountId: razorpayResp.id,
        kyc_status: razorpayResp.kyc?.status || 'pending',
      },
    });
  } catch (err) {
    // Optionally: log error, notify admin, etc.
    // Store remains with kyc_status: 'pending' and no razorpayAccountId
    console.error('Razorpay sub-account creation failed:', err);
  }
  return store;
};

export const getPendingStores = async () => {
  return await prisma.store.findMany({
    where: { status: 'pending_approval', isDeleted: false },
    orderBy: { createdAt: 'asc' },
  });
};

export const approveStore = async (storeId) => {
  const store = await prisma.store.update({
    where: { id: storeId },
    data: { status: 'approved' },
  });
  return store;
};

export const getAllApprovedStores = async ({ status = 'approved', skip = 0, take = 20 } = {}) => {
  const where = { status, isDeleted: false };
  const [stores, total] = await Promise.all([
    prisma.store.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.store.count({ where })
  ]);
  return { stores, total };
};

export const getStoreByOwner = async (ownerId) => {
  return await prisma.store.findFirst({
    where: { ownerId, isDeleted: false },
  });
};

export const updateStoreProfile = async (storeId, data) => {
  const { storeName, shopAddress, supportPhone, billingAddress } = data;
  return await prisma.store.update({
    where: { id: storeId },
    data: { storeName, shopAddress, supportPhone, billingAddress },
  });
};

export const updateStorePricing = async (storeId, data) => {
  const { blackWhitePrice, colorPrice } = data;
  return await prisma.store.update({
    where: { id: storeId },
    data: { blackWhitePrice, colorPrice },
  });
};

export const updateStoreKycStatus = async (razorpayAccountId, status) => {
  return await prisma.store.updateMany({
    where: { razorpayAccountId },
    data: { kyc_status: status },
  });
}; 