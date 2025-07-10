import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (amount, currency, receipt) => {
  const options = {
    amount: amount * 100, // amount in smallest currency unit (e.g., paise for INR)
    currency,
    receipt,
  };
  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create Razorpay order');
  }
};

export const verifyPaymentSignature = (order_id, payment_id, signature, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(order_id + '|' + payment_id);
  const generated_signature = hmac.digest('hex');
  return generated_signature === signature;
};

export const createTransfer = async (paymentId, transfers) => {
  try {
    const transfer = await razorpay.payments.transfer(paymentId, {
      transfers: transfers.map(t => ({
        account: t.account,
        amount: t.amount * 100, // amount in smallest currency unit
        currency: t.currency,
        // Optional: Add more transfer options like 'notes', 'linked_account_notes', 'on_hold'
      })),
    });
    return transfer;
  } catch (error) {
    console.error('Error creating Razorpay transfer:', error);
    throw new Error('Failed to create Razorpay transfer');
  }
};

export const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    throw new Error('Failed to fetch Razorpay payment');
  }
};

/**
 * Create a Razorpay Route sub-account (linked account) for a shop owner.
 * @param {Object} kycData - KYC fields for the sub-account
 * @returns {Promise<{ id: string, kyc: { status: string } }>} Razorpay account ID and KYC status
 */
export const createRazorpaySubAccount = async (kycData) => {
  // See: https://razorpay.com/docs/api/route/accounts/#create-an-account
  const payload = {
    name: kycData.ownerName,
    email: kycData.contactEmail,
    contact: kycData.contactPhone,
    type: kycData.businessType || 'individual',
    legal_business_name: kycData.businessName,
    business_type: kycData.businessType,
    customer_facing_business_name: kycData.businessName,
    gst: kycData.gstNumber,
    pan: kycData.pan,
    notes: {
      kycAddress: kycData.kycAddress,
      shopAddress: kycData.shopAddress,
    },
    bank_account: {
      name: kycData.ownerName,
      ifsc: kycData.ifsc,
      account_number: kycData.bankAccountNumber,
    },
    // Add more fields as needed
  };
  try {
    const account = await razorpay.accounts.create(payload);
    return { id: account.id, kyc: account.kyc }; // kyc.status: 'pending', 'verified', etc.
  } catch (error) {
    console.error('Error creating Razorpay sub-account:', error);
    throw new Error('Failed to create Razorpay sub-account');
  }
};
