import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { password, action } = await req.json();

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("zirian_session");
      return NextResponse.json({ success: true, message: "Sesión cerrada correctamente." });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || "Zirian2026!";

    if (password === adminPassword) {
      const cookieStore = await cookies();
      cookieStore.set("zirian_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Sesión iniciada con éxito." });
    } else {
      return NextResponse.json(
        { success: false, message: "Contraseña incorrecta." },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");

  if (session && session.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
