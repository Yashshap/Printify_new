import * as storeService from '../services/storeService.js';

export const registerStore = async (req, res, next) => {
  try {
    const store = await storeService.registerStore(req.body, req.user.id);
    res.status(201).json({ status: 'success', message: 'Store registered', data: store });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const getPendingStores = async (req, res, next) => {
  try {
    const stores = await storeService.getPendingStores();
    res.json({ status: 'success', message: 'Pending stores fetched', data: stores });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const approveStore = async (req, res, next) => {
  try {
    const store = await storeService.approveStore(req.params.id);
    res.json({ status: 'success', message: 'Store approved', data: store });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const getAllApprovedStores = async (req, res, next) => {
  try {
    const { status = 'approved', skip = 0, take = 20 } = req.query;
    const result = await storeService.getAllApprovedStores({
      status,
      skip: Number(skip),
      take: Number(take),
    });
    res.json({ status: 'success', message: 'Approved stores fetched', ...result });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const getStoreByOwner = async (req, res, next) => {
  try {
    const store = await storeService.getStoreByOwner(req.user.id);
    res.json({ status: 'success', message: 'Store profile fetched', data: store });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const updateStoreProfile = async (req, res, next) => {
  try {
    const store = await storeService.updateStoreProfile(req.params.id, req.body);
    res.json({ status: 'success', message: 'Store profile updated', data: store });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
};

export const updateStorePricing = async (req, res, next) => {
  try {
    const store = await storeService.updateStorePricing(req.params.id, req.body);
    res.json({ status: 'success', message: 'Store pricing updated', data: store });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, data: null });
  }
}; 