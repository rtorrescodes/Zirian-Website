import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.webUser.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user.email) {
        // Find existing Client in CRM
        let crmClient = await prisma.client.findFirst({
          where: { email: user.email }
        });
        
        // If no client, create a new Lead
        if (!crmClient) {
          crmClient = await prisma.client.create({
            data: {
              nombre: user.name || user.email.split('@')[0],
              email: user.email,
              telefono: "N/A", // Required by CRM schema
              ubicacion: "N/A", // Required by CRM schema
              origen: "Web Portal",
              status: "Lead"
            }
          });
        }

        // Upsert the WebUser in our database and link to CRM
        await prisma.webUser.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
            clientId: crmClient.id
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: "customer",
            clientId: crmClient.id
          }
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        // Fetch the webUser from DB to get their ID and Role
        const dbUser = await prisma.webUser.findUnique({
          where: { email: user.email }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
})
