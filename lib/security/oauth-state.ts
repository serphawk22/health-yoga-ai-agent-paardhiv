import { SignJWT, jwtVerify } from 'jose';
import { getJwtSecretKey } from '@/lib/jwt-config';

export type OAuthProvider = 'google' | 'spotify';

const OAUTH_STATE_TTL_SECONDS = 10 * 60;

interface CreateOAuthStateOptions {
  role?: string;
  isLogin?: boolean;
}

interface OAuthStatePayload {
  provider: OAuthProvider;
  nonce: string;
  role?: string;
  isLogin?: boolean;
}

export interface VerifiedOAuthState {
  provider: OAuthProvider;
  nonce: string;
  role?: string;
  isLogin: boolean;
}

export function getOAuthStateNonceCookieName(provider: OAuthProvider): string {
  return `health-agent-oauth-${provider}-nonce`;
}

export async function createOAuthState(
  provider: OAuthProvider,
  options: CreateOAuthStateOptions = {}
) {
  const nonce = crypto.randomUUID();

  const payload: OAuthStatePayload = {
    provider,
    nonce,
    role: options.role,
    isLogin: options.isLogin,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_STATE_TTL_SECONDS}s`)
    .sign(getJwtSecretKey());

  return {
    token,
    nonce,
    maxAge: OAUTH_STATE_TTL_SECONDS,
  };
}

export async function verifyOAuthState(
  token: string,
  expectedProvider: OAuthProvider
): Promise<VerifiedOAuthState | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    const provider = payload.provider;
    const nonce = payload.nonce;

    if (provider !== expectedProvider || typeof nonce !== 'string' || !nonce) {
      return null;
    }

    return {
      provider: expectedProvider,
      nonce,
      role: typeof payload.role === 'string' ? payload.role : undefined,
      isLogin: payload.isLogin === true,
    };
  } catch {
    return null;
  }
}
