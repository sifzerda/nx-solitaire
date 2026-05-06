## Getting Started

First, run the development server:

```bash
npm run start
```

TO DO:

- Move Styling into another file, e.g. globals
- Make a highscores page and db storage like minesweeper, recording user name/ref + time taken + number of moves

- [x] foundation dnd order
- [x] foundations have suits
- [x] dnd rules for stockpile
- [x] stockpile cycles
- [x] create dnd game rules for foundation
- [x] create dnd rules for tableau
- [x] front and back/flip cards
- [x] cards are stacked in pile
- [x] Memoized game

- [x] change inline styling to tailwind classes
- [ ] optimize memory and efficiency

- [x] enable dragging tableau stacks

- [ ] change card appearance to enable display stacked for card stack dnd
- [ ] remove trash debug dropzone

- [ ] remove 'column...', 'waste', 'tableau'
- [ ] move foundation icon into box
- [ ] restart/redraw game
- [ ] win screen, move count, time taken.

//////////////////////////////////////////////

TECH:

- SPA App Router in Next.js
- Auth using jose, JWT, bcrypt, AuthContext Provider wrapping Layout
- Prisma Neon DB
- Zustand for game state management
- useMemo to avoid memory leaks
- react-draggable
- Vercel

In Prisma 7 (updated) you now need an adapter, or Accelerate (which requires Prisma Accelerate setup)
For a neon db (vercel):

```bash
npm install @prisma/adapter-neon
```
for a prisma postgres (not neon):
```bash
npm install @prisma/adapter-pg
```

also install
```bash
npm install @prisma/client
npm install @auth/prisma-adapter
npm install next-auth
 ```

create a lib folder in root, and inside make a prisma.js and paste this into your NEON prisma.js:

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
for PG/ PRISMA POSTGRES:

```bash
// lib/prisma.js
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

then in terminal

```bash
npx prisma init
```
this will create a prisma.config.ts in root. 
Then, inside your prisma.config.ts:

```bash
npm install --save-dev prisma dotenv
```

and under datasource, paste: url: process.env.DATABASE_URL,

Then you can enter models into the schema.prisma inside your prisma folder. Every time you make a change to the schema, run this: 

```bash
npx prisma generate
```

////////////////////////////////////////

Install Auth System:
```bash
npm install jsonwebtoken
npm install jose
npm install bcrypt
```
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

when you npx create-next app, if you say no to 'import' question, 
you can't use @ imports. Unless you paste baseUrl into the jsconfig.json:

```bash
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Create a JWT secret inside .env file:

```bash
## generate a secret by gitbash: openssl rand -base64 32
```

and add this to environment variables on your vercel/postgres/neon db (under settings -> environment variables)

Then paste this for your build command inside package.json:

```bash
    "build": "prisma generate && next build",
```

this tells vercel to generate prisma on build, otherwise deployment will fail.