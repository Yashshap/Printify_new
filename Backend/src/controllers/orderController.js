import * as orderService from '../services/orderService.js';

export const createOrder = async (req, res, next) => {
  try {
    console.log('DEBUG: req.file:', req.file);
    console.log('DEBUG: req.body:', req.body);
    const { storeId, colorMode, pageRange, paymentStatus, paymentMethod, discount } = req.body;
    if (!req.file || !req.file.location) throw new Error('PDF upload failed');
    const order = await orderService.createOrder({
      userId: req.user.id,
      storeId,
      pdfUrl: req.file.location,
      colorMode,
      pageRange,
      paymentStatus,
      paymentMethod,
      discount,
    });
    res.status(201).json({ status: 'success', message: 'Order created', data: order });
  } catch (err) {
    console.error('DEBUG: createOrder error:', err);
    next(err);
  }
};

export const getShopOrders = async (req, res, next) => {
  try {
    const { status, skip = 0, take = 20 } = req.query;
    const result = await orderService.getShopOrders({
      storeId: req.params.storeId,
      status,
      skip: Number(skip),
      take: Number(take),
    });
    res.json({ status: 'success', message: 'Shop orders fetched', ...result });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { status, skip = 0, take = 20 } = req.query;
    const result = await orderService.getUserOrders({
      userId: req.user.id,
      status,
      skip: Number(skip),
      take: Number(take),
    });
    res.json({ status: 'success', message: 'User orders fetched', ...result });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ status: 'success', message: 'Order fetched', data: order });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ status: 'success', message: 'Order status updated', data: order });
  } catch (err) {
    next(err);
  }
};

export const deleteOrderPdf = async (req, res, next) => {
  try {
    const order = await orderService.deleteOrderPdf(req.params.id);
    res.json({ status: 'success', message: 'Order PDF deleted and status set to completed', data: order });
  } catch (err) {
    next(err);
  }
}; 