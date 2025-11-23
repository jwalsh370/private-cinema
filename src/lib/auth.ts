// src/lib/auth.ts
import { jwtVerify, SignJWT } from 'jose';

// Get the JWT secret from environment variables
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function createToken(payload: any): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(JWT_SECRET);
  
  return token;
}
