import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const randomToken = () => randomBytes(32).toString('base64url');
export const tokenHash = value => createHash('sha256').update(value).digest('hex');
export const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw new Error('Use a password between 12 and 256 characters.');
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, hash) {
  try {
    const [algorithm, cost, salt, expected] = String(hash).split('$');
    if (algorithm !== 'scrypt' || cost !== '16384' || !/^[a-f0-9]{128}$/.test(expected) || typeof password !== 'string' || password.length > 256) return false;
    const actual = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 });
    return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
  } catch { return false; }
}
export function signedToken(secret) { const value = `${Date.now()}.${randomToken()}`; return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`; }
export function validSignedToken(token, secret) {
  if (typeof token !== 'string') return false;
  const [time, nonce, signature] = token.split('.');
  return Number(time) > Date.now() - 3600000 && Number(time) <= Date.now() && equal(signature, createHmac('sha256', secret).update(`${time}.${nonce}`).digest('base64url'));
}
