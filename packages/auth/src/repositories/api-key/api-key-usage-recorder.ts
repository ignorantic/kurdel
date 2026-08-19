/**
 * ## ApiKeyUsageRecorder
 *
 * Records successful API-key authentication events.
 *
 * Implementations may persist usage information in any backing store,
 * such as a database or cache, without coupling authentication
 * strategies to storage details.
 */
export interface ApiKeyUsageRecorder {
  /**
   * Records the successful use of an API-key credential.
   */
  recordUsage(credentialId: string, usedAt: Date): Promise<void> | void;
}