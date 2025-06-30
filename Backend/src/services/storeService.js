import { PrismaClient } from '@prisma/client';
import { withPrefix } from '../utils/idPrefix.js';

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
    billingAddress
  } = storeData;
  const store = await prisma.store.create({
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
    },
  });
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