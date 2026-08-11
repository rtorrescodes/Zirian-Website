import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { generateSyscomOrder } from '@/lib/syscom-orders';

export async function POST(req: Request) {
  const result: any[] = await prisma.$queryRaw`SELECT value FROM "SystemSetting" WHERE key = 'stripe_environment' LIMIT 1`;
  const env = result[0]?.value || 'live';
  
  const secretKey = env === 'test' ? process.env.STRIPE_TEST_SECRET_KEY! : process.env.STRIPE_SECRET_KEY!;
  const webhookSecret = env === 'test' ? process.env.STRIPE_TEST_WEBHOOK_SECRET! : process.env.STRIPE_WEBHOOK_SECRET!;

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-07-29.dahlia' as any,
  });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const cartId = session.metadata?.cartId;
    const userId = session.metadata?.userId;

    if (!cartId) {
      console.error("No cartId found in session metadata");
      return NextResponse.json({ error: 'No cartId in metadata' }, { status: 400 });
    }

    try {
      // Get the cart and items
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error(`Cart ${cartId} not found or empty`);
      }

      // Snapshot items
      const itemsSnapshot = cart.items.map(i => ({
        productId: i.productId,
        title: i.title,
        brand: i.brand,
        model: i.model,
        priceMxn: Number(i.priceMxn),
        quantity: i.quantity
      }));

      const shipping = session.shipping_details?.address;
      const customerName = session.shipping_details?.name || session.customer_details?.name || "Cliente Web Zirian";

      // 1. Create StoreOrder in DB
      const order = await prisma.storeOrder.create({
        data: {
          userId: userId || null,
          stripeSessionId: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          status: 'paid',
          shippingAddress: shipping ? (shipping as any) : null,
          items: itemsSnapshot,
        }
      });

      // 2. Clear user cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cartId }
      });

      // 3. Generate Syscom Cotización (Dropshipping manual)
      if (shipping) {
        try {
          const syscomResult = await generateSyscomOrder({
            customerName,
            street1: shipping.line1 || "",
            street2: shipping.line2 || "",
            city: shipping.city || "",
            state: shipping.state || "",
            postalCode: shipping.postal_code || "",
            phone: session.customer_details?.phone || "",
            items: cart.items.map(i => ({
              syscomId: i.productId,
              quantity: i.quantity
            })),
            isTestMode: env === 'test'
          });

          // Update StoreOrder with Syscom info
          await prisma.storeOrder.update({
            where: { id: order.id },
            data: {
              syscomOrderId: syscomResult.cg_id ? String(syscomResult.cg_id) : null,
              syscomStatus: 'cotizacion_creada'
            }
          });

        } catch (syscomErr: any) {
          console.error("Syscom Order Failed:", syscomErr);
          await prisma.storeOrder.update({
            where: { id: order.id },
            data: { syscomStatus: 'error' }
          });
        }
      }

    } catch (err) {
      console.error("Error processing successful checkout:", err);
      return NextResponse.json({ error: 'Internal error processing order' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
