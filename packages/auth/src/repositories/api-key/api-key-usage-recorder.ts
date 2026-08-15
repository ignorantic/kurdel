/** Persists successful API-key usage without coupling strategies to storage. */
export interface ApiKeyUsageRecorder {
  recordUsage(credentialId: string, usedAt: Date): Promise<void> | void;
}
