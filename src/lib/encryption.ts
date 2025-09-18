import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

import { getEnv } from './env';
import { logger } from './logger';

const scryptAsync = promisify(scrypt);

export async function encrypt(text: string): Promise<string> {
  try {
    const env = getEnv();
    const salt = randomBytes(16);
    const iv = randomBytes(16); // Generate random IV for each encryption
    const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, 32)) as Buffer;

    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine salt, IV, and encrypted data
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
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
    const parts = encryptedText.split(':');

    // Handle both old format (salt:encrypted) and new format (salt:iv:encrypted)
    let saltHex: string;
    let ivHex: string;
    let encrypted: string;

    if (parts.length === 2) {
      // Old format - generate IV from key (less secure but backward compatible)
      saltHex = parts[0];
      encrypted = parts[1];
      const env = getEnv();
      const salt = Buffer.from(saltHex, 'hex');
      const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, 32)) as Buffer;
      // Use first 16 bytes of key as IV for backward compatibility
      ivHex = key.slice(0, 16).toString('hex');
    } else if (parts.length === 3) {
      // New format
      saltHex = parts[0];
      ivHex = parts[1];
      encrypted = parts[2];
    } else {
      throw new Error('Invalid encrypted data format');
    }

    if (!saltHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }

    const env = getEnv();
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = (await scryptAsync(env.ENCRYPTION_KEY, salt, 32)) as Buffer;

    const decipher = createDecipheriv('aes-256-cbc', key, iv);
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
