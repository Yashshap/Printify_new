import AWS from 'aws-sdk';
import { PrismaClient } from '@prisma/client';
import { withPrefix } from '../utils/idPrefix.js';

const prisma = new PrismaClient();
const s3 = new AWS.S3();
const S3_BUCKET = process.env.AWS_S3_BUCKET;

// Helper function to handle Prisma errors
const handlePrismaError = (error, operation) => {
  if (error.code === 'P2002') {
    throw new Error(`${operation} failed: Record already exists`);
  } else if (error.code === 'P2025') {
    throw new Error(`${operation} failed: Record not found`);
  } else if (error.code === 'P2003') {
    throw new Error(`${operation} failed: Foreign key constraint violation`);
  } else if (error.code === 'P2014') {
    throw new Error(`${operation} failed: Invalid ID format`);
  } else {
    console.error(`Database error during ${operation}:`, error);
    throw new Error(`${operation} failed: Database error`);
  }
};

export const createOrder = async (orderData) => {
  try {
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
  } catch (error) {
    if (error.code) {
      handlePrismaError(error, 'Order creation');
    }
    throw error;
  }
};

export const getShopOrders = async ({ storeId, status, skip = 0, take = 20 }) => {
  try {
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
              email: true,
              mobile: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);
    return { orders, total };
  } catch (error) {
    if (error.code) {
      handlePrismaError(error, 'Shop orders retrieval');
    }
    throw error;
  }
};

export const getUserOrders = async ({ userId, status, skip = 0, take = 20 }) => {
  try {
    const where = { userId, isDeleted: false };
    if (status) where.status = status;
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ 
        where, 
        orderBy: { createdAt: 'desc' }, 
        skip, 
        take,
        include: {
          store: {
            select: {
              id: true,
              storeName: true,
              storeProfileImage: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    // Generate signed URLs for PDFs
    const ordersWithSignedUrls = await Promise.all(
      orders.map(async (order) => {
        if (order.pdfUrl) {
          try {
            const signedUrl = await s3.getSignedUrlPromise('getObject', {
              Bucket: S3_BUCKET,
              Key: order.pdfUrl.split('/').pop(),
              Expires: 3600 // 1 hour
            });
            return { ...order, pdfSignedUrl: signedUrl };
          } catch (error) {
            console.error('Error generating signed URL:', error);
            return order;
          }
        }
        return order;
      })
    );

    return { orders: ordersWithSignedUrls, total };
  } catch (error) {
    if (error.code) {
      handlePrismaError(error, 'User orders retrieval');
    }
    throw error;
  }
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
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
    return order;
  } catch (error) {
    if (error.code) {
      handlePrismaError(error, 'Order update');
    }
    throw error;
  }
};

export const deleteOrderPdf = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');
    
    if (order.pdfUrl) {
      // Delete from S3
      try {
        await s3.deleteObject({
          Bucket: S3_BUCKET,
          Key: order.pdfUrl.split('/').pop(),
        }).promise();
      } catch (error) {
        console.error('Error deleting PDF from S3:', error);
      }
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        pdfUrl: null,
        status: 'completed',
        isDeleted: true 
      },
    });
    return updatedOrder;
  } catch (error) {
    if (error.code) {
      handlePrismaError(error, 'Order PDF deletion');
    }
    throw error;
  }
}; 