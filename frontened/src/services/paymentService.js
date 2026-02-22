import api from "../lib/axios";

/**
 * Create Razorpay order for an order (non-COD).
 * Backend: POST /api/payment/:orderId/createPaymentOrder
 * Returns { success, razorpayOrder }.
 */
export const createPaymentOrderAPI = async (orderId) => {
  const res = await api.post(`/payment/${orderId}/createPaymentOrder`);
  return res.data;
};

/**
 * Verify payment after Razorpay checkout.
 * Backend: POST /api/payment/:orderId/verifyPaymentOrder
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export const verifyPaymentOrderAPI = async (orderId, payload) => {
  const res = await api.post(`/payment/${orderId}/verifyPaymentOrder`, payload);
  return res.data;
};