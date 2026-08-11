import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: cartItemId } = await params;

    // Verify ownership
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    });

    if (!item || item.cart.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
