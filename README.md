This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.



//////////////////////////////////////////////

TECH:
- AuthContext wrapping in layout


In Prisma 7 (updated) you now need an adapter, or Accelerate (which requires Prisma Accelerate setup)
For a neon db (vercel):

npm install @prisma/adapter-neon

and paste this into your prisma.js:

```bash
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

console.log('DATABASE_URL exists:', !!connectionString);

const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```


Install Auth System:

npm install jsonwebtoken
npm install jose
npm install bcrypt

Create signup and login routes/pages

Create a 'lib' folder at root add files 'auth.js' and 'serverAuth.js'

auth.js:

```bash

// lib/auth.js
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = 'HS256';

export async function signJWT(payload, options = {}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(options.expiresIn || '7d')
    .sign(secret);
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

```
serverAuth.js 

```bash

// lib/serverAuth.js
import { NextResponse } from 'next/server';
import { verifyJWT } from './auth';

export async function getUserFromRequest(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const payload = await verifyJWT(token);
    return payload; // e.g. { sub: userId, email, iat, exp }
  } catch {
    return null;
  }
}

// Middleware style helper for protecting routes
export async function requireUser(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}


```

create an 'api' folder inside 'app' directory. Inside Api, make folders: login and signup. Inside those create route.js for each.

route.js (for login)

```bash
import bcrypt from 'bcrypt';
import { prisma } from '../../../../lib/prisma';
import { signJWT } from '../../../../lib/auth';

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
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    // Use your jose-based signJWT helper here
    const token = await signJWT({ sub: user.id, username: user.username, email: user.email}, { expiresIn: '1h' });

    return jsonResponse({ token }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

```

route.js for signup

```bash
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { signJWT } from '../../../../lib/auth';

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
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return jsonResponse({ error: 'Invalid email format' }, 400);
    }

    if (password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return jsonResponse({ error: 'User already exists' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    // Automatically sign a token after successful signup
    const token = await signJWT({ sub: user.id, email: user.email, username: user.username }, { expiresIn: '1h' });

    return jsonResponse({ message: 'User created successfully', token }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}


```