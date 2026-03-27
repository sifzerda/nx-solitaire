import bcrypt from 'bcrypt';
//import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
//import { signJWT } from '../../../lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return new Response("User already exists", { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return Response.json(user);
}