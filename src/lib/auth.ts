import { SignJWT, jwtVerify } from 'jose';

// La segreta JWT — in produzione usare env variable sicura
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'la-bella-tavola-jwt-secret-change-in-production-2024'
);

const TOKEN_EXPIRY_HOURS = 24;

export interface TokenPayload {
  userId: string;
  email: string;
  ruolo: string;
}

/**
 * Crea un JWT firmato per un utente autenticato.
 */
export async function createToken(user: { id: string; email: string; ruolo: string }): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    ruolo: user.ruolo,
  };

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_HOURS}h`)
    .sign(JWT_SECRET);
}

/**
 * Verifica un JWT e restituisce il payload.
 * Lancia un errore se il token non è valido o scaduto.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    userId: payload.userId as string,
    email: payload.email as string,
    ruolo: payload.ruolo as string,
  };
}