import jwt, { SignOptions, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Re-export for catch blocks
export { JsonWebTokenError, TokenExpiredError };

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set. Set it in .env.local or production environment.');
  }
  return secret;
}

export function verifyToken(token: string): { userId: string; email?: string; name?: string; plan?: string; role?: string } {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret) as { userId: string; email?: string; name?: string; plan?: string; role?: string };
  if (!decoded.userId) {
    throw new JsonWebTokenError('Invalid token: missing userId');
  }
  return decoded;
}

export function signToken(payload: Record<string, unknown>, expiresIn: string): string {
  const secret = getJwtSecret();
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
}
