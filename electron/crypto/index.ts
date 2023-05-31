import { scryptSync, createCipheriv, createDecipheriv } from "crypto";

const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0);
// First, we'll generate the key. The key length is dependent on the algorithm.
// In this case for aes192, it is 24 bytes (192 bits).

export function encrypt(password: string, plain: string): Promise<string> {
    return new Promise((resolve) => {
        const key = scryptSync(password, 'salt', 24);
        const cipher = createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(plain, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        resolve(encrypted);
    });    
};

export function decrypt(password: string, code: string): Promise<string> {
    return new Promise((resolve) => {
        const key = scryptSync(password, 'salt', 24);
        const decipher = createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(code, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        resolve(decrypted);
    });
}