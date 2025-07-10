import AWS from 'aws-sdk';
import { PrismaClient } from '@prisma/client';
import { withPrefix } from '../utils/idPrefix.js';

const prisma = new PrismaClient();
const s3 = new AWS.S3();
const S3_BUCKET = process.env.AWS_S3_BUCKET;

export const createOrder = async (orderData) => {
  const { userId, storeId, pdfUrl, colorMode, pageRange, paymentStatus, paymentMethod, discount = 0 } = orderData;
  // Fetch store pricing
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error('Store not found');
  // Calculate number of pages from pageRange (e.g., "1-5" or "2,4,6")
  let totalPages = 1;
  if (pageRange.includes('-')) {
    const [start, end] = pageRange.split('-').map(Number);
    totalPages = end - start + 1;
  } else if (pageRange.includes(',')) {
    totalPages = pageRange.split(',').length;
  } else {
    totalPages = 1;
  }
  // Calculate price
  let pricePerPage = colorMode === 'color' ? store.colorPrice : store.blackWhitePrice;
  if (!pricePerPage) pricePerPage = 0;
  const price = pricePerPage * totalPages;
  const finalPrice = Math.max(0, price - discount);
  const order = await prisma.order.create({
    data: {
      id: withPrefix('ORD'),
      userId,
      storeId,
      pdfUrl,
      colorMode,
      pageRange,
      status: 'pending',
      price,
      paymentStatus,
      paymentMethod,
      discount,
      finalPrice,
    },
  });
  return order;
};

export const getShopOrders = async ({ storeId, status, skip = 0, take = 20 }) => {
  const where = { storeId, isDeleted: false };
  if (status) where.status = status;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' }, 
      skip, 
      take,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mobile: true,
            email: true
          }
        }
      }
    }),
    prisma.order.count({ where })
  ]);
  // Generate signed URLs for each order's PDF
  const signedOrders = await Promise.all(orders.map(async order => {
    if (order.pdfUrl) {
      try {
        const url = new URL(order.pdfUrl);
        const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
        const signedUrl = s3.getSignedUrl('getObject', {
          Bucket: S3_BUCKET,
          Key: key,
          Expires: 300 // 5 minutes
        });
        return { ...order, pdfUrl: signedUrl };
      } catch (e) {
        return { ...order, pdfUrl: null };
      }
    }
    return order;
  }));
  return { orders: signedOrders, total };
};

export const getUserOrders = async ({ userId, status, skip = 0, take = 20 }) => {
  const where = { userId, isDeleted: false };
  if (status) where.status = status;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.order.count({ where })
  ]);
  return { orders, total };
};

export const getOrderById = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId, isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mobile: true,
          email: true
        }
      }
    }
  });
  if (!order) throw new Error('Order not found');
  return order;
};

export const updateOrderStatus = async (orderId, status) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

export const updateOrder = async (orderId, updateData) => {
  return await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });
};

export const deleteOrderPdf = async (orderId) => {
  // Fetch order to get PDF URL
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.pdfUrl) throw new Error('Order or PDF not found');

  // Parse S3 key from URL
  const url = new URL(order.pdfUrl);
  const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

  // Delete from S3
  await s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }).promise();

  // Update order: remove PDF and set status to completed
  return await prisma.order.update({
    where: { id: orderId },
    data: { pdfUrl: null, status: 'completed' },
  });
}; 