export interface PasswordHasher {
  hash(password: string): Promise<string> | string;
  verify(password: string, encodedHash: string): Promise<boolean> | boolean;
}
