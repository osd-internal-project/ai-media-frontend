import CryptoJS from 'crypto-js';
import { getEnv } from '../lib/env';

// Secret key for encryption/decryption
// IMPORTANT: In production, this should be stored securely (environment variable)
const SECRET_KEY = getEnv('NEXT_PUBLIC_CRYPTO_SECRET') || 'your-secret-key-change-in-production';

/**
 * Encrypts a password using AES encryption
 * @param password - The plain text password to encrypt
 * @returns Encrypted password string
 */
export const encryptPassword = (password: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
};

/**
 * Decrypts an encrypted password
 * @param encryptedPassword - The encrypted password string
 * @returns Decrypted plain text password
 */
export const decryptPassword = (encryptedPassword: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8);

    if (!originalPassword) {
      throw new Error('Decryption failed - invalid password or key');
    }

    return originalPassword;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
};
