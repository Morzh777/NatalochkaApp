// encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SECRET_KEY!.slice(0, 32); // 256-bit key
const IV_LENGTH = 16;

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
}

export function decrypt(text: string): string {
    const [ivPart, encrypted] = text.split(':');
    const iv = Buffer.from(ivPart, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export function hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
}
