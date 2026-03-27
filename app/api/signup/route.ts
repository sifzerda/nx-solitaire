import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // Validate input
    if (!email || !password || !username) {
      return Response.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { error: "User already exists" },
        { status: 409 } // ✅ correct status
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Return safe response (DO NOT include password)
    return Response.json(
      {
        success: true,
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}