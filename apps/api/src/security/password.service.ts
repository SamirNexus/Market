import { Injectable } from '@nestjs/common';
import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(nodeScrypt);
const KEY_LENGTH = 64;
const PREFIX = 'scrypt';

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

    return [
      PREFIX,
      salt.toString('base64url'),
      derived.toString('base64url'),
    ].join('$');
  }

  async verify(password: string, stored: string): Promise<boolean> {
    const [prefix, saltEncoded, hashEncoded] = stored.split('$');

    if (prefix !== PREFIX || !saltEncoded || !hashEncoded) {
      return false;
    }

    try {
      const salt = Buffer.from(saltEncoded, 'base64url');
      const expected = Buffer.from(hashEncoded, 'base64url');
      const actual = (await scrypt(password, salt, expected.length)) as Buffer;

      return expected.length === actual.length
        && timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }
}
