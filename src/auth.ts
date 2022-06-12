import crypto from 'crypto';
import https from 'https';
import http from 'http';
import { createError } from './errors';

export const createPemFetcher = (auth0HostName: string, cacheLimitInMinutes: number = 60): PemFetcher => {
  const cacheLimit = cacheLimitInMinutes * 1000 * 60;
  let pem: string | null = null;
  let fetchedAt: Date | null = null;

  const cacheIsExpired = () => {
    if (fetchedAt === null) {
      return true;
    }
    const cacheAge = new Date().getTime() - fetchedAt.getTime();
    return cacheAge > cacheLimit;
  };

  const shouldRefetch = () => {
    return pem === null || cacheIsExpired();
  };

  const getPem = (): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!shouldRefetch() && typeof pem === 'string') {
        resolve(pem);
      }
      const req = https.request(
        {
          hostname: auth0HostName,
          path: '/PEM',
          method: 'GET',
        },
        res => {
          const data: Uint8Array[] = [];
          res.on('data', chunk => data.push(chunk));
          res.on('end', () => {
            pem = Buffer.concat(data).toString();
            fetchedAt = new Date();
            resolve(pem);
          });
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      req.end();
    });

  return getPem;
};

export type PemFetcher = () => Promise<string>;

export const createAuthenticator = (pemFetcher: PemFetcher): Authenticator => {
  const validateToken = (token: string): Promise<DecodedUser> =>
    new Promise((resolve, reject) => {
      const [jwtHeader, jwtPayload, jwtSignature] = token.split('.');
      if (!jwtHeader || !jwtPayload || !jwtSignature) {
        reject(createError.unauthorized('Malformed JWT token'));
        return;
      }
      const jwtSignatureBase64 = Buffer.from(jwtSignature, 'base64url').toString('base64');
      const verifyFn = crypto.createVerify('RSA-SHA256');
      verifyFn.write(`${jwtHeader}.${jwtPayload}`);
      verifyFn.end();
      pemFetcher()
        .then(pem => {
          const signatureIsValid = verifyFn.verify(pem, jwtSignatureBase64, 'base64');
          if (!signatureIsValid) {
            reject(createError.unauthorized('Invalid JWT token signature'));
            return;
          }
          try {
            const user = JSON.parse(Buffer.from(jwtPayload, 'base64url').toString('utf-8')) as DecodedUser;
            const tokenExpiresAt = new Date(user.exp * 1000);
            if (tokenExpiresAt.getTime() < new Date().getTime()) {
              reject(createError.unauthorized('Token has expired'));
              return;
            }
            resolve(user);
          } catch (err) {
            reject(createError.unauthorized('Invalid token'));
          }
        })
        .catch(reject);
    });

  const authHeaderRegex = /(?<=^Bearer\s).+$/;

  const authenticateRequest = (req: http.IncomingMessage): Promise<DecodedUser> => {
    return new Promise((resolve, reject) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        reject(createError.unauthorized('Missing authorization header'));
        return;
      }
      const tokenRegExpMatch = authHeader.match(authHeaderRegex);
      if (!tokenRegExpMatch || !tokenRegExpMatch[0]) {
        reject(createError.unauthorized('Missing authorization header'));
        return;
      }
      const token = tokenRegExpMatch[0];
      validateToken(token).then(resolve).catch(reject);
    });
  };

  return authenticateRequest;
};

export type Authenticator = (req: http.IncomingMessage) => Promise<DecodedUser>;

export interface DecodedUser {
  iss: string;
  sub: string;
  aud: Array<string>;
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}
