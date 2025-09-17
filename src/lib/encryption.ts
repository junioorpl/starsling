import { createCipher, createDecipher, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

import { getEnv } from './env';
import { logger } from './logger';

const scryptAsync = promisify(scrypt);

export async function encrypt(text: string): Promise<string> {
  try {
    const env = getEnv();
    const salt = randomBytes(16);
    const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, 32)) as Buffer;

    const cipher = createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine salt and encrypted data
    return `${salt.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error(
      'Failed to encrypt data',
      { textLength: text.length },
      error as Error
    );
    throw new Error('Encryption failed');
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  try {
    const [saltHex, encrypted] = encryptedText.split(':');
    if (!saltHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }

    const env = getEnv();
    const salt = Buffer.from(saltHex, 'hex');
    const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, 32)) as Buffer;

    const decipher = createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error(
      'Failed to decrypt data',
      { encryptedTextLength: encryptedText.length },
      error as Error
    );
    throw new Error('Decryption failed');
  }
}
