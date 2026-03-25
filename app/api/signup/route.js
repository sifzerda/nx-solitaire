import bcrypt from 'bcrypt';
//import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { signJWT } from '../../../lib/auth';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(req) {
  try {
    // Try parsing the request body and log it
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return jsonResponse({ error: 'Invalid JSON format' }, 400);
    }

    const { email, password, username } = body;

    if (!email || !password || !username) {
      return jsonResponse({ error: 'Email, username, and password are required' }, 400);
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return jsonResponse({ error: 'Invalid email format' }, 400);
    }

    if (password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Prisma checks with logging
    console.log('Checking if username exists...');
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    console.log('Existing username:', existingUsername);

    if (existingUsername) {
      return jsonResponse({ error: 'Username already taken' }, 400);
    }

    console.log('Checking if email exists...');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    console.log('Existing user:', existingUser);

    if (existingUser) {
      return jsonResponse({ error: 'User already exists' }, 400);
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user in DB...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });
    console.log('Created user:', user);

    console.log('Signing JWT...');
    const token = await signJWT(
      { sub: user.id, email: user.email, username: user.username },
      { expiresIn: '1h' }
    );

    console.log('Signup successful, sending response...');
    return jsonResponse({ message: 'User created successfully', token }, 201);
  } catch (error) {
    console.error('Signup error caught in catch block:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    return jsonResponse({ error: 'Internal server error', details: error.message }, 500);
  }
}