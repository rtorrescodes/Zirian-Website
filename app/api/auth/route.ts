import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken, verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, action } = body;

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("zirian_session");
      return NextResponse.json({ success: true, message: "Sesión cerrada correctamente." });
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Faltan credenciales." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash || !user.activo) {
      return NextResponse.json(
        { success: false, message: "Credenciales incorrectas o usuario inactivo." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordMatch) {
      const cookieStore = await cookies();
      
      const token = await createToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.nombre,
      });

      cookieStore.set("zirian_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({ 
        success: true, 
        message: "Sesión iniciada con éxito.",
        user: { name: user.nombre, role: user.role }
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Contraseña incorrecta." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");

  if (session && session.value) {
    try {
      const payload = await verifyAuth(session.value);
      const dbUser = await prisma.user.findUnique({ where: { id: payload.id } });
      if (dbUser) {
        payload.name = dbUser.nombre;
        payload.role = dbUser.role;
      }
      return NextResponse.json({ authenticated: true, user: payload });
    } catch (err) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
