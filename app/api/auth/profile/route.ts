import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("zirian_session");
    
    if (!session || !session.value) {
      return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
    }

    let currentUser;
    try {
      currentUser = await verifyAuth(session.value);
    } catch {
      return NextResponse.json({ success: false, message: "Sesión inválida." }, { status: 401 });
    }

    const { nombre, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado." }, { status: 404 });
    }

    const dataToUpdate: any = { nombre };

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, message: "Debes ingresar tu contraseña actual para cambiarla." }, { status: 400 });
      }

      if (!user.passwordHash) {
        return NextResponse.json({ success: false, message: "Este usuario no tiene una contraseña asignada." }, { status: 400 });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json({ success: false, message: "La contraseña actual es incorrecta." }, { status: 401 });
      }

      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, message: "Perfil actualizado correctamente." });

  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, message: "Error interno del servidor." }, { status: 500 });
  }
}
