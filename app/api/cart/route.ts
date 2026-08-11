import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch the current user's cart
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Serialize Decimals for Next.js
    const serializedItems = cart.items.map(item => ({
      ...item,
      priceMxn: Number(item.priceMxn),
    }));

    return NextResponse.json({ ...cart, items: serializedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add or update an item in the cart
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, title, brand, model, image, priceMxn, quantity = 1 } = body;

    if (!productId || !title || priceMxn === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          title,
          brand,
          model,
          image,
          priceMxn,
          quantity,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Clear the entire cart
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
