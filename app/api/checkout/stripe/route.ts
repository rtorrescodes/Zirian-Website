import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // Determine Stripe environment dynamically
    const result: any[] = await prisma.$queryRaw`SELECT value FROM "SystemSetting" WHERE key = 'stripe_environment' LIMIT 1`;
    const env = result[0]?.value || 'live';
    const secretKey = env === 'test' ? process.env.STRIPE_TEST_SECRET_KEY! : process.env.STRIPE_SECRET_KEY!;

    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-07-29.dahlia' as any,
    });

    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const { origin } = new URL(req.url);

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email as string,
      client_reference_id: cart.id,
      shipping_address_collection: {
        allowed_countries: ['MX'], // Only allow shipping within Mexico
      },
      metadata: {
        cartId: cart.id,
        userId: session.user.id
      },
      line_items: cart.items.map(item => ({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: item.title,
            images: item.image ? [item.image] : undefined,
            description: item.brand ? `Marca: ${item.brand}` : undefined,
          },
          // Stripe expects the amount in cents
          unit_amount: Math.round(Number(item.priceMxn) * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${origin}/es/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/es/store/cart`,
    });

    return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
