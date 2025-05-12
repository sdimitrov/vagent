import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES-GCM, IV is typically 12 bytes, but 16 bytes (128 bits) is also common and secure.
const SALT_LENGTH = 16;
const KEY_LENGTH = 32; // For AES-256
const PBKDF2_ITERATIONS = 100000; // Number of iterations for PBKDF2

// Ensure ENCRYPTION_KEY is set in your environment variables
const ENCRYPTION_KEY_STRING = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY_STRING) {
  console.error('FATAL ERROR: ENCRYPTION_KEY environment variable is not set.');
  // In a real application, you might want to throw an error or exit
  // For now, this will cause issues if encryption is attempted without a key
}

// It's better to derive a key of a fixed length using a KDF like PBKDF2
// For simplicity in this example, if a raw key is provided and it's the correct length,
// we might use it directly, but PBKDF2 is more robust if the env var is a password.
// Here, we'll assume ENCRYPTION_KEY is a high-entropy secret string that we'll
// hash to ensure it's the correct length for an encryption key.
// A more robust solution would use a proper Key Derivation Function (KDF)
// if the ENCRYPTION_KEY is more like a password.
// For this implementation, we will hash the ENCRYPTION_KEY_STRING to ensure it's 32 bytes.
let encryptionKey: Buffer;
if (ENCRYPTION_KEY_STRING) {
  encryptionKey = crypto.createHash('sha256').update(String(ENCRYPTION_KEY_STRING)).digest();
} else {
  // Fallback to a dummy key if not set, with a warning. THIS IS NOT SECURE FOR PRODUCTION.
  console.warn('Warning: ENCRYPTION_KEY is not set. Using a dummy key. THIS IS NOT SECURE.');
  encryptionKey = crypto.randomBytes(KEY_LENGTH); // Generate a random key for placeholder
}


export function encrypt(text: string): string | null {
  if (!text) {
    return null;
  }
  if (!ENCRYPTION_KEY_STRING) {
    console.error('Encryption cannot proceed: ENCRYPTION_KEY is not set.');
    // Or throw new Error('ENCRYPTION_KEY is not set.');
    // Depending on how you want to handle this, returning null or throwing.
    // For now, returning null to avoid breaking flow if called without key, but this is a severe issue.
    return null; 
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Prepend IV and authTag to the encrypted text for use during decryption
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

export function decrypt(encryptedText: string): string | null {
  if (!encryptedText) {
    return null;
  }
   if (!ENCRYPTION_KEY_STRING) {
    console.error('Decryption cannot proceed: ENCRYPTION_KEY is not set.');
    return null;
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      console.error('Decryption failed: Invalid encrypted text format.');
      return null; // Or throw an error
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    // This can happen if the key is wrong, data is corrupted, or authTag mismatch.
    return null;
  }
}
