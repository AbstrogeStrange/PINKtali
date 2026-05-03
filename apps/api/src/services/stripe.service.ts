import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10',
});

export const createCheckoutSession = async (priceId: string, customerId: string) => {
  // Mock logic
  return { id: 'cs_test_mock', url: 'https://checkout.stripe.com/mock' };
};
